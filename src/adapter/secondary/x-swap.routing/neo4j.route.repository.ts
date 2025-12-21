import { Inject, Injectable } from "@nestjs/common";
import { Token } from "src/domain/token.class";
import { NEO4J_ADAPTER,  } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import { ProtocolInfo, validateProtocolInfo } from "src/domain/defi-type.enum";
import { Route } from "src/domain/x-swap.type";
import { ManagedTransaction } from "neo4j-driver";
import { X_SWAP_CHAIN_REPOSITORY, X_SWAP_PROTOCOL_REPOSITORY, X_SWAP_TOKEN_REPOSITORY } from "src/module/module.token";
import { IXSwapStepRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.route.repository";
import { type IXSwapTokenRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.token.repository";
import { type IXSwapProtocolRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.protocol.repository";
import Cypher from "@neo4j/cypher-builder";
import { type IXSwapChainRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.chain.repository";
import { PROTOCOL_SUPPORT_CHAIN_REL_NAME } from "src/infrastructure/neo4j/relation.type.constant";

@Injectable()
export class Neo4JRouteRepository implements IXSwapStepRepository {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
        @Inject(X_SWAP_TOKEN_REPOSITORY)
        private readonly tokenRepository: IXSwapTokenRepository<ManagedTransaction, string>,
        @Inject(X_SWAP_PROTOCOL_REPOSITORY)
        private readonly protocolRepository: IXSwapProtocolRepository<ManagedTransaction, string>,
        @Inject(X_SWAP_CHAIN_REPOSITORY)
        private readonly chainRepository: IXSwapChainRepository<ManagedTransaction, number>
    ) {}
    
    async saveRoute(route: Route): Promise<void> {
        const session = this.adapter.getSession()

        try {
            await session.executeWrite(async (tx) => {
                for (const step of route.steps) {
                    await this.saveStep(
                        step.srcToken,
                        step.dstToken,
                        step.protocolInfo,
                        tx
                    )
                }
            });
        } catch (error) {
            console.log("[ERROR]" + error)
            throw error
        } finally {
            session.close()
        }
    }

    private async saveCrossChainSwapRouteRelationship(
        tx: ManagedTransaction,
        protocolInfo: ProtocolInfo,
        srcTokenId: string,
        dstTokenId: string,
        protocolId: string,
    ) {
        // 런타임 검증: protocolType과 protocolName 일관성 확인
        validateProtocolInfo(protocolInfo);

        // 1. 새로운 Cypher.Node 객체 생성 (쿼리 빌더용)
        const srcNode = new Cypher.Node();
        const dstNode = new Cypher.Node();
        const srcToDstRel = new Cypher.Relationship();
        const dstToSrcRel = new Cypher.Relationship();
        
        // 체이닝으로 연결
        const query = new Cypher.Match(
            new Cypher.Pattern(srcNode, {
                labels: ['Token'],
                properties: { tokenId: new Cypher.Param(srcTokenId) }
            })
        )
        .match(
            new Cypher.Pattern(dstNode, {
                labels: ['Token'],
                properties: { tokenId: new Cypher.Param(dstTokenId) }
            })
        )
        // srcNode -> dstNode  swap/bridge relation 생성
        .merge(
            new Cypher.Pattern(srcNode)
                .related(srcToDstRel, {
                    type: protocolInfo.protocolType,
                    properties: { protocolId: new Cypher.Param(protocolId) }
                })
                .to(dstNode)
        )
        .onCreateSet(
            [srcToDstRel.property('protocolType'), new Cypher.Param(protocolInfo.protocolType)],
            [srcToDstRel.property('protocolName'), new Cypher.Param(protocolInfo.protocolName)],
            [srcToDstRel.property('version'), new Cypher.Param(protocolInfo.version)],
        )
        // dstNode -> srcNode  swap/bridge relation 생성 (Swap, Bridge는 일반적으로 양방향 가능하기 때문에.)
        .merge(
            new Cypher.Pattern(dstNode)
                .related(dstToSrcRel, {
                    type: protocolInfo.protocolType,
                    properties: { protocolId: new Cypher.Param(protocolId) }
                })
                .to(srcNode)
        )
        .onCreateSet(
            [dstToSrcRel.property('protocolType'), new Cypher.Param(protocolInfo.protocolType)],
            [dstToSrcRel.property('protocolName'), new Cypher.Param(protocolInfo.protocolName)],
            [dstToSrcRel.property('version'), new Cypher.Param(protocolInfo.version)],
        );

        const { cypher, params } = query.build()

        await tx.run(cypher, params);
    }

    private async protocolChainRelation(
        tx: ManagedTransaction,
        protocolNodeProtocolId: string,
        chainNodeChainId: number
    ) {
        const chainNode = new Cypher.Node();
        const protocolNode = new Cypher.Node();
        const relation = new Cypher.Relationship()

        const relationId = `${protocolNodeProtocolId}-${chainNodeChainId}`

        const query = new Cypher.Match(
            new Cypher.Pattern(chainNode, {
                labels: ['Chain'],
                properties: { chainId: new Cypher.Param(chainNodeChainId) }
            })
        ).match(
            new Cypher.Pattern(protocolNode, {
                labels: ['Protocol'],
                properties: { protocolId: new Cypher.Param(protocolNodeProtocolId) }
            })
        ).merge(
            new Cypher.Pattern(protocolNode)
                .related(relation, {
                    type: PROTOCOL_SUPPORT_CHAIN_REL_NAME,
                    properties: { protocolSupportChainId: new Cypher.Param(relationId) }
                })
                .to(chainNode)
        ).build()

        await tx.run(query.cypher, query.params)
    }

    private async addProtocolSupporitingChainRelationship(
        tx: ManagedTransaction,
        protocolNodeProtocolId: string,
        srcChainNodeChainId: number,
        srcDstNodeChainId: number,
    ) {
        await this.protocolChainRelation(tx, protocolNodeProtocolId, srcChainNodeChainId);
        await this.protocolChainRelation(tx, protocolNodeProtocolId, srcDstNodeChainId);
    }

    private async saveStep(
        srcToken: Token, 
        dstToken: Token, 
        protocolInfo: ProtocolInfo,
        tx: ManagedTransaction,
    ): Promise<void> {
        try {
            if (srcToken.chain.id === dstToken.chain.id){
                await this.chainRepository.saveIfNotExists(srcToken.chain, tx)
            } else {
                await this.chainRepository.saveIfNotExists(srcToken.chain, tx)
                await this.chainRepository.saveIfNotExists(dstToken.chain, tx)
            }

            const srcTokenId = await this.tokenRepository.saveIfNotExists(srcToken, tx)
            const dstTokenId = await this.tokenRepository.saveIfNotExists(dstToken, tx)

            const protocolId = await this.protocolRepository.saveIfNotExists(protocolInfo, tx)

            await this.saveCrossChainSwapRouteRelationship(tx, protocolInfo, srcTokenId, dstTokenId, protocolId)

            await this.addProtocolSupporitingChainRelationship(tx, protocolId, srcToken.chain.id, dstToken.chain.id)
        } catch (error) {
            console.log("[ERROR]" + error)
            throw error
        }
    }
}

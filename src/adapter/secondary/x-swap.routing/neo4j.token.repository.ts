import { Inject, Injectable } from "@nestjs/common";
import { Token } from "src/domain/token.class";
import { NEO4J_ADAPTER } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import Cypher from '@neo4j/cypher-builder';
import { ManagedTransaction } from "neo4j-driver";
import { IXSwapTokenRepository } from "src/application/x-swap.routing/required_port/x-swap.token.repository";

@Injectable()
export class Neo4JXSwapTokenRepository implements IXSwapTokenRepository<ManagedTransaction, string> {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
    ) {}

    makeTokenId(chianId: number, addressStr: string): string {
        return `${chianId}:${addressStr.toLowerCase()}`
    }

    private buildQuery(token: Token, tokenId: string): Cypher.Return {
        const tokenNode = new Cypher.Node();
        const chainNode = new Cypher.Node();
        const inChainRelation = new Cypher.Relationship();

        return new Cypher.Match(
            new Cypher.Pattern(chainNode, {
                labels: ['Chain'],
                properties: { chainId: new Cypher.Param(token.chain.id) }
            })
        ).merge(
            new Cypher.Pattern(tokenNode, {
                labels: ['Token'],
                properties: { tokenId: new Cypher.Param(tokenId) }
            })
        ).onCreateSet(
            [tokenNode.property('address'), new Cypher.Param(token.address.address.toLowerCase())],
            [tokenNode.property('symbol'), new Cypher.Param(token.symbol)],
            [tokenNode.property('chainId'), new Cypher.Param(token.chain.id)],
            [tokenNode.property('decimals'), new Cypher.Param(token.decimals)],
            [tokenNode.property('name'), new Cypher.Param(token.name)],
            [tokenNode.property('isNative'), new Cypher.Param(token.isNativeToken)],
            [tokenNode.property('logoUri'), new Cypher.Param(token.logoUri)],
        )
        .merge(
            new Cypher.Pattern(tokenNode)
            .related(inChainRelation, {
                type: 'IN_CHAIN',
            })
            .to(chainNode)
        ).return([tokenNode.property('tokenId'), 'tokenId']);
    }

    async saveIfNotExists(
        token: Token,
        transactional: ManagedTransaction | null
    ): Promise<string> {
        const tokenId = this.makeTokenId(token.chain.id, token.address.address);
        const query = this.buildQuery(token, tokenId)
        const { cypher, params } = query.build();

        const session = transactional ?? this.adapter.getSession()
        try {
            const result = await session.run(cypher, params)
            if (!result.records[0]) {
                throw new Error(`Token missing with chainId ${token.chain.id}.`);
            }
            return result.records[0].get("tokenId");
        } catch (error) {
            console.log("[Error] " + error)
            throw error
        } finally {
            if (!(session instanceof ManagedTransaction)) {
                session.close()
            }
        }
    }
}

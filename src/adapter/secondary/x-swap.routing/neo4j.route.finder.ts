import { Inject, Injectable } from "@nestjs/common";
import { Token } from "src/domain/token.class";
import { NEO4J_ADAPTER } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import { ProtocolType } from "src/domain/defi-type.enum";
import { Route } from "src/domain/x-swap.type";
import { ManagedTransaction } from "neo4j-driver";
import { X_SWAP_ROUTE_RESULT_CONVERTER, X_SWAP_TOKEN_REPOSITORY } from "src/module/module.token";
import { IXSwapRouteFinder } from "src/application/x-swap.routing/required_port/x-swap.route.finder";
import { type IXSwapTokenRepository } from "src/application/x-swap.routing/required_port/x-swap.token.repository";
import { type INeo4JResultConverter } from "./required_port/neo4j.result.converter.interface";
import { CHAIN_HOST_TOKEN_REL_NAME } from "src/infrastructure/neo4j/relation.type.constant";

@Injectable()
export class Neo4JRouteFinder implements IXSwapRouteFinder {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
        @Inject(X_SWAP_TOKEN_REPOSITORY)
        private readonly tokenRepository: IXSwapTokenRepository<ManagedTransaction, string>,
        @Inject(X_SWAP_ROUTE_RESULT_CONVERTER)
        private readonly resultConverter: INeo4JResultConverter,
    ) {}

    async findRoutes(srcToken: Token, dstToken: Token, maxHops: number = 5): Promise<Route[]> {
        const session = this.adapter.getSession();
        
        try {
            const srcTokenId = this.tokenRepository.makeTokenId(srcToken.chain.id, srcToken.address.address)
            const dstTokenId = this.tokenRepository.makeTokenId(dstToken.chain.id, dstToken.address.address)
            
            // Cypher: 변수 길이 경로 탐색 & apoc를 사용하여 cycle 방지
            const relTypes: string[] = Object.values(ProtocolType);
            const pathVariableName = "path"

            const query = `
                MATCH ${pathVariableName} = (src:Token {tokenId: $srcTokenId})-[rels*1..${maxHops}]->(dst:Token {tokenId: $dstTokenId})
                WHERE ALL(r in rels WHERE type(r) IN $relTypes)
                AND size(nodes(${pathVariableName})) = size(apoc.coll.toSet([n in nodes(${pathVariableName}) | n.tokenId]))
                
                // 각 Token 노드와 연결된 Chain 노드 가져오기
                WITH ${pathVariableName}, 
                    [token IN nodes(${pathVariableName}) | [(chain:Chain)-[:${CHAIN_HOST_TOKEN_REL_NAME}]->(token) | chain][0]] AS chains
                
                RETURN ${pathVariableName}, chains
                LIMIT 100
            `
            /*
                MATCH path = (src:Token {tokenId: $srcTokenId})-[rels*1..5]->(dst:Token {tokenId: $dstTokenId})
                WHERE ALL(r in rels WHERE type(r) IN $relTypes)
                AND size(nodes(path)) = size(apoc.coll.toSet([n in nodes(path) | n.tokenId]))
                
                // 각 Token 노드와 연결된 Chain 노드 가져오기
                WITH path, 
                    [token IN nodes(path) | [(chain:Chain)-[:HOSTS_TOKEN]->(token) | chain][0]] AS chains
                
                RETURN path, chains
                LIMIT 100
            */

            const result = await session.executeRead(async tx => {
                return await tx.run(query, {
                    srcTokenId,
                    dstTokenId,
                    relTypes,
                });
            });

            return this.resultConverter.convertPathsToRoutes(result, pathVariableName)
            
        } catch(error) {
            console.log("[ERROR] findRoutes() " + error)
            throw error
        } finally {
            await session.close()
        }
    }
}

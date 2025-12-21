import { Inject, Injectable } from "@nestjs/common";
import { NEO4J_ADAPTER } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import Cypher from '@neo4j/cypher-builder';
import { ManagedTransaction, Node } from "neo4j-driver";
import { IXSwapChainRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.chain.repository";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class Neo4JXSwapChainRepository implements IXSwapChainRepository<ManagedTransaction, number> {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
    ) {}

    private buildQuery(chainInfo: ChainInfo): Cypher.Return {
        // `
        // MERGE (chain:Chain {chainId: $chainId})
        // ON CREATE SET 
        //     chain.name = $name
        //     chain.testnet = $testnet,
        // RETURN chain.chainId
        // `
        const chainId = chainInfo.id
        const chainNode = new Cypher.Node();

        return new Cypher.Merge(
            new Cypher.Pattern(chainNode, {
                labels: ['Chain'],
                properties: { chainId: new Cypher.Param(chainId) }
            })
        ).onCreateSet(
            [chainNode.property('name'), new Cypher.Param(chainInfo.name)],
            [chainNode.property('testnet'), new Cypher.Param(chainInfo.testnet ?? false)],
        ).return([chainNode.property('chainId'), 'chainId']);
    }

    async saveIfNotExists(
        chainInfo: ChainInfo,
        transactional: ManagedTransaction | null
    ): Promise<number> {
        const query = this.buildQuery(chainInfo)
        const { cypher, params } = query.build();

        const session = transactional ?? this.adapter.getSession()

        try {
            const result = await session.run(cypher, params)
            if (!result.records[0]) {
                throw new Error(`Chain missing with chainId ${chainInfo.id}.`);
            }
            return result.records[0].get("chainId");
        } catch (error) {
            console.log("[Error] " + error)
            throw error
        } finally {
            if (!(session instanceof ManagedTransaction)){
                session.close()
            }
        }
    }
}

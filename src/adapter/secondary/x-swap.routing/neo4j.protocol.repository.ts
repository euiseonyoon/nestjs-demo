import { Inject, Injectable } from "@nestjs/common";
import { NEO4J_ADAPTER } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import { ProtocolInfo } from "src/domain/defi-type.enum";
import Cypher from '@neo4j/cypher-builder';
import { ManagedTransaction } from "neo4j-driver";
import { IXSwapProtocolRepository } from "src/application/x-swap.routing/repository/required_port/x-swap.protocol.repository";

@Injectable()
export class Neo4JXSwapProtocolRepository implements IXSwapProtocolRepository<ManagedTransaction, string> {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
    ) {}

    makeProtocolId(protocolInfo: ProtocolInfo): string {
        return `${protocolInfo.protocolName}_${protocolInfo.protocolType}_${protocolInfo.version}`;
    }

    buildQuery(protocol: ProtocolInfo): Cypher.Return {
        const protocolId: string = this.makeProtocolId(protocol);
        const protocolNode = new Cypher.Node();

        return new Cypher.Merge(
            new Cypher.Pattern(protocolNode, {
                labels: ['Protocol'],
                properties: { protocolId: new Cypher.Param(protocolId) }
            })
        ).onCreateSet(
            [protocolNode.property('name'), new Cypher.Param(protocol.protocolName)],
            [protocolNode.property('type'), new Cypher.Param(protocol.protocolType.valueOf())],
            [protocolNode.property('version'), new Cypher.Param(protocol.version)],
            [protocolNode.property('usedCount'), new Cypher.Param(1)]
        ).onMatchSet(
            // 이미 존재할 경우 기존 값에 1을 더함
            [
                protocolNode.property('usedCount'), 
                Cypher.plus(protocolNode.property('usedCount'), new Cypher.Param(1))
            ]
        )
        
        .return([protocolNode.property('protocolId'), 'protocolId']);
    }

    async saveIfNotExists(
        protocol: ProtocolInfo, 
        transactional: ManagedTransaction | null,
    ): Promise<string> {
        const query = this.buildQuery(protocol)
        const { cypher, params } = query.build();

        const session = transactional ?? this.adapter.getSession()

        try {
            const result = await session.run(cypher, params)
            if (!result.records[0]) {
                throw new Error(`Protocol missing. ${protocol}.`);
            }
            return result.records[0].get("protocolId");
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

import { Inject, Injectable } from "@nestjs/common";
import { NEO4J_ADAPTER } from "src/infrastructure/infrastructure.token";
import { type INeo4JAdapter } from "../neo4j/provided_port/neo4j.adapter.interface";
import { ProtocolInfo } from "src/domain/defi-type.enum";
import Cypher from '@neo4j/cypher-builder';
import { ManagedTransaction } from "neo4j-driver";
import { IXSwapProtocolRepository } from "src/application/x-swap.routing/required_port/x-swap.protocol.repository";

@Injectable()
export class Neo4JXSwapProtocolRepository implements IXSwapProtocolRepository<ManagedTransaction, string> {
    constructor(
        @Inject(NEO4J_ADAPTER)
        private readonly adapter: INeo4JAdapter,
    ) {}

    makeProtocolId(protocolInfo: ProtocolInfo): string {
        return `${protocolInfo.name}_${protocolInfo.type}_${protocolInfo.version}`;
    }

    buildQuery(protocol: ProtocolInfo): Cypher.Return {
        // `
        // MERGE (protocol:Protocol {protocolId: $protocolId})
        // ON CREATE SET 
        //     protocol.name = $name,
        //     protocol.type = $type,
        //     protocol.version = $version,
        // RETURN protocol.protocolId as protocolId
        // `
        const protocolId: string = this.makeProtocolId(protocol);
        const protocolNode = new Cypher.Node();

        return new Cypher.Merge(
            new Cypher.Pattern(protocolNode, {
                labels: ['Protocol'],
                properties: { protocolId: new Cypher.Param(protocolId) }
            })
        ).onCreateSet(
            [protocolNode.property('name'), new Cypher.Param(protocol.name)],
            [protocolNode.property('type'), new Cypher.Param(protocol.type.valueOf())],
            [protocolNode.property('version'), new Cypher.Param(protocol.version)],
        ).return([protocolNode.property('protocolId'), 'protocolId']);
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

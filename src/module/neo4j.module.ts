// src/neo4j/neo4j.module.ts
import { Module } from '@nestjs/common';
import { Neo4JAdapter } from 'src/adapter/secondary/neo4j/neo4j.adapter';
import { NEO4J_ADAPTER, NEO4J_DRIVER_PROVIDER } from 'src/infrastructure/infrastructure.token';
import { Neo4JDriverProvider } from 'src/infrastructure/neo4j/neo4j.driver.provider';

@Module({
    providers: [
        { provide: NEO4J_DRIVER_PROVIDER, useClass: Neo4JDriverProvider },
        { provide: NEO4J_ADAPTER, useClass: Neo4JAdapter },
    ],
    exports: [
        NEO4J_ADAPTER,
    ],
})
export class Neo4jModule {}

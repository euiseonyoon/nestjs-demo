import { Module } from '@nestjs/common';
import { X_SWAP_PROTOCOL_REPOSITORY, X_SWAP_ROUTE_REPOSITORY, X_SWAP_ROUTE_FINDER, X_SWAP_TOKEN_REPOSITORY, X_SWAP_ROUTE_REPOSITORY_SERVICE, X_SWAP_CHAIN_REPOSITORY, X_SWAP_ROUTE_RESULT_CONVERTER } from './module.token';
import { Neo4JRouteRepository } from 'src/adapter/secondary/x-swap.routing/neo4j.route.repository';
import { Neo4jModule } from './neo4j.module';
import { Neo4JRouteRepositoryFinder } from 'src/adapter/secondary/x-swap.routing/neo4j.route.finder';
import { Neo4JXSwapTokenRepository } from 'src/adapter/secondary/x-swap.routing/neo4j.token.repository';
import { Neo4JXSwapProtocolRepository } from 'src/adapter/secondary/x-swap.routing/neo4j.protocol.repository';
import { Neo4JXSwapRouteRepositoryService } from 'src/application/x-swap.routing/x-swap.route.repository.service';
import { Neo4JXSwapChainRepository } from 'src/adapter/secondary/x-swap.routing/neo4j.chain.repository';
import { Neo4JResultConverter } from 'src/infrastructure/neo4j/neo4j.result.converter';

@Module({
    imports: [
        Neo4jModule
    ],
    providers: [
        { provide: X_SWAP_ROUTE_RESULT_CONVERTER, useClass: Neo4JResultConverter},
        { provide: X_SWAP_CHAIN_REPOSITORY, useClass: Neo4JXSwapChainRepository},
        { provide: X_SWAP_PROTOCOL_REPOSITORY, useClass: Neo4JXSwapProtocolRepository },
        { provide: X_SWAP_TOKEN_REPOSITORY, useClass: Neo4JXSwapTokenRepository },
        { provide: X_SWAP_ROUTE_REPOSITORY, useClass: Neo4JRouteRepository },
        { provide: X_SWAP_ROUTE_FINDER, useClass: Neo4JRouteRepositoryFinder },
        { provide: X_SWAP_ROUTE_REPOSITORY_SERVICE, useClass: Neo4JXSwapRouteRepositoryService },
    ],
    exports: [
        X_SWAP_ROUTE_REPOSITORY_SERVICE,
    ]
})
export class XSwapRouteRepositoryModule {}

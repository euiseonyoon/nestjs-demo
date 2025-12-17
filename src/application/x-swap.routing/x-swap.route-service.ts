import { Inject, Injectable } from "@nestjs/common";
import { IXSwapRouteService } from "./provided_port/x-swap.route-service.interface";
import { Token } from "src/domain/token.class";
import { Route } from "src/domain/x-swap.type";
import { X_SWAP_ROUTE_REPOSITORY, X_SWAP_ROUTE_FINDER } from "src/module/module.token";
import { type IXSwapStepRepository } from "./required_port/x-swap.route.repository";
import { type IXSwapRouteFinder } from "./required_port/x-swap.route.finder";

@Injectable()
export class Neo4JXSwapRouteService implements IXSwapRouteService {
    constructor(
        @Inject(X_SWAP_ROUTE_REPOSITORY)
        private readonly stepRepository: IXSwapStepRepository,
        @Inject(X_SWAP_ROUTE_FINDER)
        private readonly routesFinder: IXSwapRouteFinder
    ) {}

    async saveCrossChainSwapRoute(route: Route): Promise<void> {
        await this.stepRepository.saveRoute(route)
    }

    async findCrossChainSwapRoutes(srcToken: Token, dstToken: Token, maxHops?: number): Promise<Route[]> {
        return await this.routesFinder.findRoutes(srcToken, dstToken, maxHops)
    }
}

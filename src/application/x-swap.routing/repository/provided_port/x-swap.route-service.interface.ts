import { Token } from "src/domain/token.class"
import { Route } from "src/domain/x-swap.type"

export interface IXSwapRouteRepositoryService {
    saveCrossChainSwapRoute(
        route: Route
    ): Promise<void>

    findCrossChainSwapRoutes(
        srcToken: Token, dstToken: Token, maxHops?: number
    ): Promise<Route[]>
}

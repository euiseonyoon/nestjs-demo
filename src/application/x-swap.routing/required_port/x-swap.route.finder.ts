import { Token } from "src/domain/token.class";
import { Route } from "src/domain/x-swap.type";

export interface IXSwapRouteFinder {
    findRoutes(srcToken: Token, dstToken: Token, maxHops?: number): Promise<Route[]>;
}

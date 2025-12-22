import { Inject, Injectable } from "@nestjs/common";
import { IXSwapRouteService } from "./provided_port/x-swap.route.service.interface";
import { Token } from "src/domain/token.class";
import { QuoteRoute } from "src/domain/x-swap.type";
import { X_SWAP_ROUTE_SWAP_HELPER } from "src/module/module.token";
import type { IXSwapRouteSwapHelper } from "./required_port/x-swap.route.swap.helper.interface";

@Injectable()
export class XSwapRouteService implements IXSwapRouteService {
    constructor(
        @Inject(X_SWAP_ROUTE_SWAP_HELPER)
        private readonly swapRouteHelper: IXSwapRouteSwapHelper,
    ) {}
    
    async findRoutes(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string,
        slippagePercentStr: string,
    ): Promise<QuoteRoute[]> {
        let allRoutes: QuoteRoute[] = []

        // 1. swap으로만 가능한지 판단
        if(srcToken.chain.id === dstToken.chain.id) {
            // single swap으로 가능한지 판단
            const singleSwapQuoteRoutes = await this.swapRouteHelper.checkOneSwapRoute(srcToken, dstToken, srcAmount, slippagePercentStr)
            allRoutes.push(...singleSwapQuoteRoutes)

            // swap - swap 으로 가능한지 판단
            if (singleSwapQuoteRoutes.length === 0) {
                const doubleSwapRoutes = await this.swapRouteHelper.checkDoubleSwapRoute(srcToken, dstToken, srcAmount, slippagePercentStr)
                allRoutes.push(...doubleSwapRoutes)
            }
        }
        // 2. bridge로만 가능한지 판단

        return allRoutes
    }
}

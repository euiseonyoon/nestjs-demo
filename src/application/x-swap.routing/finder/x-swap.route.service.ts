import { Inject, Injectable } from "@nestjs/common";
import { IXSwapRouteService } from "./swap/provided_port/x-swap.route.service.interface";
import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { QuoteRoute } from "src/domain/x-swap.type";
import { X_SWAP_ROUTE_SWAP_HELPER, X_SWAP_ROUTE_BRIDGE_HELPER } from "src/module/module.token";
import type { IXSwapRouteSwapHelper } from "./swap/required_port/x-swap.route.swap.helper.interface";
import type { IXSwapRouteBridgeHelper } from "./bridge/required_port/x-swap.route.bridge.helper.interface";

@Injectable()
export class XSwapRouteService implements IXSwapRouteService {
    constructor(
        @Inject(X_SWAP_ROUTE_SWAP_HELPER)
        private readonly swapRouteHelper: IXSwapRouteSwapHelper,
        @Inject(X_SWAP_ROUTE_BRIDGE_HELPER)
        private readonly bridgeRouteHelper: IXSwapRouteBridgeHelper,
    ) {}
    
    async findRoutes(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string, // Human-readable amount (NOT wei). Example: "0.5" for 0.5 ETH
        slippagePercentStr: string,
        userAccount: EvmAddress,
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
        if (srcToken.chain.id !== dstToken.chain.id) {
            const bridgeRoute = await this.bridgeRouteHelper.checkOneBridgeRoute({
                srcToken,
                dstToken,
                srcAmount,
                userAccount,
            });

            if (bridgeRoute) {
                allRoutes.push(bridgeRoute);
            }
        }

        return allRoutes
    }
}

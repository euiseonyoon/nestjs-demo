import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { QuoteRoute } from "src/domain/x-swap.type";

export interface IXSwapRouteService {
    findRoutes(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string, // Human-readable amount (NOT wei). Example: "0.5" for 0.5 ETH
        slippagePercentStr: string,
        userAccount: EvmAddress,
    ): Promise<QuoteRoute[]>
}

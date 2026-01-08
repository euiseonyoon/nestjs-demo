import { Token } from "src/domain/token.class";
import { QuoteRoute } from "src/domain/x-swap.type";
import { EvmAddress } from "src/domain/evm-address.class";

export type BridgeRouteRequest = {
    srcToken: Token;
    dstToken: Token;
    srcAmount: string; // Human-readable amount (NOT wei). Example: "0.5" for 0.5 ETH
    userAccount: EvmAddress;
}

export interface IXSwapRouteBridgeHelper {
    checkOneBridgeRoute(request: BridgeRouteRequest): Promise<QuoteRoute | null>;
}

import { RouteStatus } from "sushi/evm";

export type SushiSwapQuoteSuccessResponse = {
    status: RouteStatus.Success,
    amountIn: string,
    assumedAmountOut: string,
    gasSpent: number,
    swapPrice: number,
    tokenFrom: number,
    tokenTo: number,
    tokens: SushiSwapQuoteToken[],
}

export type SushiSwapQuoteToken = {
    address: string,
    symbol: string,
    name: string,
    decimals: number,
}

// curl -X 'GET' \
//   'https://api.sushi.com/quote/v7/137?referrer=none
// &tokenIn=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
// &tokenOut=0xccf2c9dd05bf25b20fd462843ae34254a5e5df6c. <-- 전혀 유명하지 않은 erc20 
// &amount=10000000000000000000
// &fee=0
// &feeBy=output
// &maxPriceImpact=1
// &maxSlippage=0.005
// &visualize=false' \
//   -H 'accept: application/json'
export type SushiSwapQuoteNoWayResponse = {
    status: RouteStatus.NoWay;
};

export type SushiSwapQuotePartialResponse = {
    status: RouteStatus.Partial;
};

export type SushiSwapQuoteResponse = SushiSwapQuoteSuccessResponse | SushiSwapQuoteNoWayResponse | SushiSwapQuotePartialResponse;

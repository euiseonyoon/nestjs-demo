// Classic Swap quote response. START
// https://api.1inch.com/swap/v6.1/{chain}/quote
export type ClassicSwapQuoteResponse = {
    srcToken?: TokenInfo;
    dstToken?: TokenInfo;
    dstAmount: string;
    protocols?: TokenSwaps[];
    gas?: string;
}

// Token information
export type TokenInfo = {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;
    domainVersion?: string;
    eip2612?: boolean;
    isFoT?: boolean;
    tags?: string[];
}

// Protocol routing information
export type TokenSwaps = {
    token: string;
    hops: TokenHop[];
    gas?: number;
}

export type TokenHop = {
    part: number;
    dst: string;
    fromTokenId: number;
    toTokenId: number;
    protocols: SelectedLiquiditySource
}

export type SelectedLiquiditySource = {
    name: string;
    part: number;
}
// Classic Swap quote response. END

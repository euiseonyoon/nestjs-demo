export interface OneInchTokenData {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    logoURI: string;
    eip2612: boolean;
    tags: string[];
}

export interface OneInchTokensResponse {
    tokens: {
        [address: string]: OneInchTokenData;
    };
}

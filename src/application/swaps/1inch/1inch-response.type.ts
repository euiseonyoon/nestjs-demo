// 1inch API 응답 타입 정의
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

// TOKEN API
// https://api.1inch.com/token/v1.4/{chainId}/custom/{address}
export type TokeDto = {
    chainId: number,
    symbol: string,
    name: string,
    address: string,
    decimals: number,

}


// History API
// https://api.1inch.com/history/v2.0/history/{address}/events
// {
//    "items":[
//       {
//          "timeMs":1764485771058,
//          "address":"0x99fed0d5377b45a52962228547e7abffc51fc789",
//          "type":0,
//          "rating":"reliable",
//          "direction":"out",
//          "details":{
//             "txHash":"0x9a8ba8633ee9c1c3a0a33ebe36374325739d148d9f13faae981ba2d076c36c0a",
//             "chainId":1,
//             "blockNumber":23909828,
//             "blockTimeSec":1764485771,
//             "status":"completed",
//             "type":"SwapExactInput",
//             "tokenActions":[
//                {
//                   "chainId":"1",
//                   "address":"0xdac17f958d2ee523a2206206994597c13d831ec7",
//                   "standard":"ERC20",
//                   "fromAddress":"0x99fed0d5377b45a52962228547e7abffc51fc789",
//                   "toAddress":"0x111111125421ca6dc452d289314280a0f8842a65",
//                   "amount":"1000000",
//                   "direction":"Out"
//                },
//                {
//                   "chainId":"1",
//                   "address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//                   "standard":"ERC20",
//                   "fromAddress":"0x111111125421ca6dc452d289314280a0f8842a65",
//                   "toAddress":"0x99fed0d5377b45a52962228547e7abffc51fc789",
//                   "amount":"999312",
//                   "direction":"In"
//                }
//             ],
//             "fromAddress":"0x99fed0d5377b45a52962228547e7abffc51fc789",
//             "toAddress":"0x111111125421ca6dc452d289314280a0f8842a65",
//             "nonce":7,
//             "orderInBlock":58,
//             "feeInSmallestNative":"298659454007343"
//          },
//          "id":"401140348908544",
//          "eventOrderInTransaction":0
//       }
//    ],
//    "cache_counter":1
// }

export type TokenActionDto = {
    address: string,
    standard: string,
    fromAddress: string,
    toAddress: string,
    direction: string,
    amount: string,
}

export type TransactionDetailsDto = {
    orderInBlock: number,
    txHash: string,
    chainId: number,
    blockNumber: number,
    blockTimeSec: number,
    status: string,
    type: string,
    tokenActions: TokenActionDto[],
    fromAddress: string,
    toAddress: string,
    nonce: number,
    feeInSmallestNative: string,
}

export type HistoryEventDto = {
    id: string,
    address: string,
    type: number,
    rating: string,
    timeMs: number,
    details: TransactionDetailsDto,
}

export type OneInchHistoryResponseDto = {
    items: HistoryEventDto[]
    cache_control: number
}

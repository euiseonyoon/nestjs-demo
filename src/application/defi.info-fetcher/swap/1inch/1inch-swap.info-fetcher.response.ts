// curl -X GET \
//       "https://api.1inch.com/history/v2.0/history/0x99fED0d5377B45A52962228547e7Abffc51Fc789/events?limit=100&chainId=1&toTimestampMs=1764486071058&fromTimestampMs=1764485171058" \
//       -H "Authorization: Bearer {여기는 api key}" \
//       -H "accept: application/json" \
//       -H "content-type: application/json"

import { ChainInfo } from "src/domain/chain-info.type"

// HISTORY response
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



// QUOTE response
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


// TOKEN info response
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

export type OneInchChainAndTokens = {
    chainInfo: ChainInfo,
    response: OneInchTokensResponse,
}

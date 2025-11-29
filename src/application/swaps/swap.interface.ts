import { ChainInfo } from "src/common/chain-info.type";
import { Token } from "src/common/token.type";


// Same-chain swap
export type SameChainSwapQuoteRequest = {
    type: 'same-chain',
    chain: ChainInfo,
    srcToken: Token,
    dstToken: Token,
    amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
}

// Cross-chain swap
export type CrossChainSwapQuoteRequest = {
    type: 'cross-chain',
    srcChain: ChainInfo,
    dstChain: ChainInfo,
    srcToken: Token,
    dstToken: Token,
    amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
}

// Union
export type SwapQuoteRequest = SameChainSwapQuoteRequest | CrossChainSwapQuoteRequest;


export interface ISwapService {
    getQuote(quoteRequest: SwapQuoteRequest): Promise<string | undefined>
}

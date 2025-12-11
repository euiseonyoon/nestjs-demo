import { Token } from "src/domain/token.class";

export class SimpleSwapQuoteRequest {
    constructor(
        readonly srcToken: Token,
        readonly dstToken: Token,
        readonly amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
        readonly slippagePercentStr: string, // "0.5"는 0.5% -> 0.005
        readonly maxPriceImpactPercent: number | null
    ) {
        if (srcToken.chain.id !== dstToken.chain.id) {
            throw new Error("SrcToken and DstToken must be on the same chain");
        }

        if (maxPriceImpactPercent) {
            if (maxPriceImpactPercent > 100 || maxPriceImpactPercent < 0) {
                throw new Error("maxPriceImpact should be between 0 to 100");
            }
        }
    }
}

export class CrossSwapQuoteRequest {
    constructor(
        readonly srcToken: Token,
        readonly dstToken: Token,
        readonly amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
        readonly slippagePercentStr: string // "0.5"는 0.5% -> 0.005
    ) {
        if (srcToken.chain.id === dstToken.chain.id) {
            throw new Error("SrcToken and DstToken must be on different chians.");
        }
    }
}

// Union
export type SwapQuoteRequest = SimpleSwapQuoteRequest | CrossSwapQuoteRequest;

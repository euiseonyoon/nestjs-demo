import { SwapQuoteRequest } from "../request.type"
import { TokenAmount } from "src/domain/common-defi.type"

export interface ISwapQuoter {
    getQuote(quoteRequest: SwapQuoteRequest): Promise<TokenAmount | null>
}

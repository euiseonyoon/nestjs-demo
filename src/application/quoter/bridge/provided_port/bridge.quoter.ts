import { TokenAmount } from "src/domain/common-defi.type"
import { BridgeQuoteRequest } from "../request.type"

export interface IBridgeQuoter {
    getQuote(request: BridgeQuoteRequest): Promise<TokenAmount | null>
}

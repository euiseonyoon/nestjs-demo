import { TokenAmount } from "src/domain/common-defi.type";
import { NaiveSwapOutAmountRequest, NaiveSwapQuoteRequest } from "../request.type";

export interface ISwapService {
    getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<TokenAmount | null>

    getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null>
}

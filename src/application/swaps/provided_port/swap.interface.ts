import { TokenAmount } from "src/domain/common-defi.type";
import { NaiveSwapOutAmountRequest, NaiveSwapQuoteRequest } from "../request.type";
import { SwapQuoteResponse } from "../response.type";

export interface ISwapService {
    getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteResponse | null>

    getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null>
}

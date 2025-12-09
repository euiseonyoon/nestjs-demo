import { SwapOutAmountRequest, NaiveSwapQuoteRequest } from "../request.type";
import { SwapOutAmountResponse, SwapQuoteResponse } from "../response.type";

export interface ISwapService {
    getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteResponse | null>

    getSwapOutAmount(request: SwapOutAmountRequest): Promise<SwapOutAmountResponse | undefined>
}

import { SwapOutAmountRequest, SwapQuoteRequest } from "../request.type";
import { SwapOutAmountResponse, SwapQuoteResponse } from "../response.type";

export interface ISwapService {
    getQuote(quoteRequest: SwapQuoteRequest): Promise<SwapQuoteResponse | undefined>

    getRecentSwapOutAmount(request: SwapOutAmountRequest): Promise<SwapOutAmountResponse | undefined>
}

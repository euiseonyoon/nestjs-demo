import { BridgeQuoteRequest } from "../request.type";
import { BridgeQuoteResponse } from "../response.type";

export interface IBridgeService {
    getQuote(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse | undefined>
}

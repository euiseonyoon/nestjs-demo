import { BridgeHistoryRequest, BridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse, BridgeQuoteResponse } from "../response.type";

export interface IBridgeService {
    getQuote(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse | undefined>

    getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>
}

import { TokenAmount } from "src/domain/common-defi.type";
import { BridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse } from "../response.type";

export interface IBridgeService {
    getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null>

    getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>
}

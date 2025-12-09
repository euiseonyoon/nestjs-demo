import { TokenAmount } from "src/domain/common-defi.type";
import { NaiveBridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse } from "src/application/amount-getter/bridge/request.bridge-amount";

export interface IBridgeService {
    getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null>

    getBridgeOutAmount(request: NaiveBridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>
}

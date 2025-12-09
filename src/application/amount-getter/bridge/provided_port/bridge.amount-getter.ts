import { BridgeOutAmountResponse } from "../request.bridge-amount";
import { BridgeHistoryRequest } from "../response.bridge-amount";

export interface IBridgeAmountGetter {
    getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>
}
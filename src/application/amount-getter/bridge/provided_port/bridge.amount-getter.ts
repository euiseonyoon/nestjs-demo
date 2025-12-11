import { BridgeOutAmountResponse } from "../request.bridge-amount";
import { BridgeAmountRequest } from "../response.bridge-amount";

export interface IBridgeAmountGetter {
    getBridgeOutAmount(request: BridgeAmountRequest) : Promise<BridgeOutAmountResponse | null>
}
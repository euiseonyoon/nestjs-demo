import { SwapOutAmountRequest } from "../request.swap-smount";
import { TokenAmount } from "src/domain/common-defi.type";

export interface ISwapAmountGetter {
    getSwapOutAmount(request: SwapOutAmountRequest): Promise<TokenAmount | null>
}

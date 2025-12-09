import { TokenAmount } from "../../domain/common-defi.type";

export type BridgeOutAmountResponse = {
    status: string,
    bridgeOutAmount: TokenAmount | null
}

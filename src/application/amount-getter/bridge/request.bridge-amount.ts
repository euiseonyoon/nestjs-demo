import { TokenAmount } from "src/domain/common-defi.type";

export type BridgeOutAmountResponse = {
    status?: string,
    bridgeOutAmount: TokenAmount | null
}

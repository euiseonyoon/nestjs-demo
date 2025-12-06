import { TokenAmount } from "../../domain/common-defi.type";

export type BridgeQuoteResponse = TokenAmount
export type BridgeOutAmountResponse = {
    status: string,
    bridgeOutAmount: TokenAmount | null
}

import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";

export type BridgeQuoteRequest = {
    srcToken: Token,
    dstToken: Token,
    amount: number,
    receiverAddress: EvmAddress,
    senderAddresss: EvmAddress,
}

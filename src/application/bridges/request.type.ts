import { ChainInfo } from "src/common/chain-info.type"
import { EvmAddress } from "src/common/evm-address.class"
import { EvmTxHash } from "src/common/evm-tx-hash.class"
import { Token } from "src/common/token.class"

export type BridgeQuoteRequest = {
    srcToken: Token,
    dstToken: Token,
    amount: number,
    receiverAddress: EvmAddress,
    senderAddresss: EvmAddress,
}

export type BridgeHistoryRequest = {
    srcToken: Token,
    dstToken: Token,
    srcTxHash: EvmTxHash,
}
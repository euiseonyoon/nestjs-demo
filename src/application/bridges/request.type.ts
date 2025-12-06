import { ChainInfo } from "src/domain/chain-info.type"
import { EvmAddress } from "src/domain/evm-address.class"
import { EvmTxHash } from "src/domain/evm-tx-hash.class"
import { Token } from "src/domain/token.class"

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
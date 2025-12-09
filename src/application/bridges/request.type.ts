import { EvmAddress } from "src/domain/evm-address.class"
import { EvmTxHash } from "src/domain/evm-tx-hash.class"

export type NavieBridgeQuoteRequest = {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: EvmAddress,
    dstTokenAddress: EvmAddress,
    bridgeInAmount: number, // ethereum 1.5개 bridge시 1.5  (decimal 적용되지 않은 개수)
    receiverAddress: EvmAddress,
    senderAddresss: EvmAddress,
}

export type NaiveBridgeHistoryRequest = {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: EvmAddress,
    dstTokenAddress: EvmAddress,
    srcTxHash: EvmTxHash,
}

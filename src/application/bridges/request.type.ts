import { ChainInfo } from "src/domain/chain-info.type"
import { EvmAddress } from "src/domain/evm-address.class"
import { EvmTxHash } from "src/domain/evm-tx-hash.class"
import { Token } from "src/domain/token.class"

export type NavieBridgeQuoteRequest = {
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: EvmAddress,
    dstTokenAddress: EvmAddress,
    bridgeInAmount: number, // ethereum 1.5개 bridge시 1.5  (decimal 적용되지 않은 개수)
    receiverAddress: EvmAddress,
    senderAddresss: EvmAddress,
}

export type BridgeHistoryRequest = {
    srcToken: Token,
    dstToken: Token,
    srcTxHash: EvmTxHash,
}
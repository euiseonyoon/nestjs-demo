import { ChainInfo } from "src/domain/chain-info.type"
import { EvmAddress } from "src/domain/evm-address.class"
import { EvmTxHash } from "src/domain/evm-tx-hash.class"

export type SwapOutAmountRequest = {
    chain: ChainInfo,
    senderAddress: EvmAddress,
    receiverAddress: EvmAddress,
    txHash: EvmTxHash,
}

import { EvmAddress } from "src/domain/evm-address.class"

export type ChainCacheKeyInput = {
    chainId: number,
    tokenAddress: EvmAddress
}

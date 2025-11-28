"address"
import { ChainInfo } from "./chain-info.type"
import { EvmAddress } from "./evm-address.class"

export type Token = {
    chain: ChainInfo,
    address: EvmAddress,
    symbol: string,
    decimals: number,
    name: string,
    logoUri?: string
}
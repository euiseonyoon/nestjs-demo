import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";

export interface IDefiProtocolInfoProvider {
    getSupportingChains(): Promise<ChainInfo[]>
    getSupportingTokens(): Promise<Token[]>
    getSupportingChainInfo(chainId: number): Promise<ChainInfo | null>
    getSupportingToken(chinId: number, tokenAddress: EvmAddress): Promise<Token | null>
}

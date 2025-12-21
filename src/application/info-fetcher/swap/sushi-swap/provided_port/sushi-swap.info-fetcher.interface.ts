import { ChainInfo } from "src/domain/chain-info.type";
import { PriceResponse } from "../sushi-swap.response";
import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";

export interface ISushiSwapInfoFetcher {
    getSupportingChains(): Promise<ChainInfo[]>

    fetchSupportingTokenAddresses(chainId: number): Promise<PriceResponse | null>

    getToken(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null>
}
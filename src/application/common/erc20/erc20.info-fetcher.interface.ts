import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";

export interface IErc20InfoFetcher {
    getToken(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null>
}

export type TokenDetail = {
    decimals: number,
    name: string,
    symbol: string,
}

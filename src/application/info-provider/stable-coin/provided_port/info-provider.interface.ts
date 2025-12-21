import { ChainInfo } from "src/domain/chain-info.type";
import { Token } from "src/domain/token.class";

export interface IStableCoinInfoProvider {
    getStableCoins(chainInfo: ChainInfo): Promise<Token[] | null>
}

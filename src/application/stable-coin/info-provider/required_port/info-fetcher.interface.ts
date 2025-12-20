import { Token } from "src/domain/token.class";

export interface IStableCoinInfoFetcher {
    fetchStableCoins() : Promise<Token[] | null>
}

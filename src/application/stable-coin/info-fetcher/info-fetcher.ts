import { Inject, Injectable } from "@nestjs/common";
import { IStableCoinInfoFetcher } from "../info-provider/required_port/info-fetcher.interface";
import { Token } from "src/domain/token.class";
import { HTTP_CLIENT } from "src/module/module.token";
import type { IHttpClient } from "src/application/common/required_port/http-client.interface";
import { CoinGeckoCoinDetailResponse } from "./coin-gecko.stable-coin.response";
import { STABLECOIN_IDS } from "./coin-gecko.constant";
import { CoinGeckoHelper } from "./coin-gecko.helper";

@Injectable()
export class StableCoinInfoFetcher implements IStableCoinInfoFetcher {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient
    ){}

    async fetchStableCoins(): Promise<Token[] | null> {
        const promises = Object.values(STABLECOIN_IDS).map((stableCoinName) => {
            return this.fetchByCoinGeckoApi(stableCoinName)
        })

        const results = await Promise.all(promises)
        const stableCoins = results.map((response) => {
            if (response) {
                return CoinGeckoHelper.getEvmStableCoins(response)
            }
        }).filter((token) => token !== undefined)
        .flat()

        return stableCoins
    }

    private async fetchByCoinGeckoApi(coinkey: string): Promise<CoinGeckoCoinDetailResponse | null> {
        const response = await this.httpClient.get<CoinGeckoCoinDetailResponse>(
            `https://api.coingecko.com/api/v3/coins/${coinkey}`, 
        )
        return response.data
    }

}

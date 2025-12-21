import { Inject, Injectable } from "@nestjs/common";
import { IStableCoinInfoFetcher } from "../info-provider/required_port/info-fetcher.interface";
import { Token } from "src/domain/token.class";
import { HTTP_CLIENT } from "src/module/module.token";
import { RetryConfig, type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { CoinGeckoCoinDetailResponse } from "./coin-gecko.stable-coin.response";
import { STABLECOIN_IDS } from "./coin-gecko.constant";
import { CoinGeckoHelper } from "./coin-gecko.helper";
import { chunkArray } from "src/utils/array/array.utils";

@Injectable()
export class StableCoinInfoFetcher implements IStableCoinInfoFetcher {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient
    ){}

    async fetchStableCoins(): Promise<Token[] | null> {                                                                                                                            
        const CHUNK_SIZE = 5;
        const DELAY_BETWEEN_CHUNKS_MS = 700;
        
        const chunks = chunkArray(Object.values(STABLECOIN_IDS), CHUNK_SIZE);
        
        const allResults: (CoinGeckoCoinDetailResponse | null)[] = [];

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(coinName =>                                                                                                                            
                this.fetchByCoinGeckoApi(coinName)
            );
            const chunkResults = await Promise.all(chunkPromises);
            allResults.push(...chunkResults);
                                                                                                                                                                                    
            if (chunk !== chunks[chunks.length - 1]) {
                await this.delay(DELAY_BETWEEN_CHUNKS_MS);
            }
        }

        const stableCoins = allResults
            .map(response => response ? CoinGeckoHelper.getEvmStableCoins(response) : undefined)
            .filter(token => token !== undefined)
            .flat();
                                                                                                                                                                                    
        return stableCoins;
    }                                                                                                                                                                              
                                                                                                                                                                                    
                                                                                                                                                                                    
    private delay(ms: number): Promise<void> {                                                                                                                                     
        return new Promise(resolve => setTimeout(resolve, ms));                                                                                                                    
    }               

    private async fetchByCoinGeckoApi(coinkey: string): Promise<CoinGeckoCoinDetailResponse | null> {
        const response = await this.httpClient.get<CoinGeckoCoinDetailResponse>(
            `https://api.coingecko.com/api/v3/coins/${coinkey}`, 
            {
                retryConfig: new RetryConfig (
                    {
                        maxAttempts: 5,
                        delayExponential: false,
                    }
                )
            }
        )
        return response.data
    }

}

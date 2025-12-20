import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { IStableCoinInfoProvider } from "./provided_port/info-provider.interface";
import { ChainInfo } from "src/domain/chain-info.type";
import { Token } from "src/domain/token.class";
import  { type IStableCoinInfoFetcher } from "./required_port/info-fetcher.interface";
import { CACHE_REGISTRY, STABLE_COIN_CACHE_KEY_GENERATOR, STABLE_COIN_CACHE_NAME, STABLE_COIN_INFO_FETCHER } from "src/module/module.token";
import { AbstractCacheInstance } from "src/application/cache/cache.instance/provided_port/cache.instance.interface";
import { type ICacheKeyGenerator } from "src/application/cache/key.generator/provided_port/cache.key.generator";
import { type ICacheRegistry } from "src/application/cache/registry/provided_port/cache.registry.interface";
import _ from 'lodash';
import { Cron } from "@nestjs/schedule";

@Injectable()
export class StableCoinInfoProvider implements IStableCoinInfoProvider {
    private stableCoinCache: AbstractCacheInstance<string, Set<Token>>

    constructor(
        @Inject(STABLE_COIN_INFO_FETCHER)
        private readonly infoFetcher: IStableCoinInfoFetcher,
        @Inject(STABLE_COIN_CACHE_KEY_GENERATOR)
        private readonly keyGenerator: ICacheKeyGenerator<string, ChainInfo>,
        @Inject(CACHE_REGISTRY)
        cacheRegistry: ICacheRegistry
    ) {
        const cacheInstance = cacheRegistry.getCacheInstance<string, Set<Token>>(STABLE_COIN_CACHE_NAME)
        if (!cacheInstance) {
            throw Error("Stable Token Cache is missing");
        }
        this.stableCoinCache = cacheInstance
    }

    async getStableCoins(chainInfo: ChainInfo): Promise<Token[] | null> {
        const key = this.keyGenerator.genKey(chainInfo);
        
        let stableCoins = await this.stableCoinCache.get(key);

        if (!stableCoins) {
            await this.refreshStableCoin();
            stableCoins = await this.stableCoinCache.get(key);
        }

        return stableCoins ? [...stableCoins] : null;
    }

    @Cron('0 0 3 * * *')
    private async refreshStableCoin() {
        const result = await this.infoFetcher.fetchStableCoins()
        if (!result) return

        const grouped = _.groupBy(result, token => token.chain);

        Object.entries(grouped).forEach(([chainKey, tokens]) => {
            const chain = tokens[0].chain; // 같은 그룹이므로 첫 번째 토큰의 chain
            const key = this.keyGenerator.genKey(chain);
            this.stableCoinCache?.save(key, new Set(tokens));
        });
    }

}

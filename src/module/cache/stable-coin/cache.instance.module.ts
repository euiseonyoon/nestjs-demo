import { Global, Module } from '@nestjs/common';
import { 
    STABLE_COIN_CACHE_INSTANCE,
    STABLE_COIN_CACHE_REPO, 
} from '../../module.token';
import { StableCoinInfoProviderChainInfoCacheInstance } from 'src/application/cache/cache.instance/stable-coin/stable-coin.cache.instance';
import { StableCoinInfoProviderStableCoinCacheRepo } from 'src/application/cache/cache.repository/stable-coin/chain.repo';

@Global()
@Module({
    providers: [
        { provide: STABLE_COIN_CACHE_REPO, useClass: StableCoinInfoProviderStableCoinCacheRepo },
        { provide: STABLE_COIN_CACHE_INSTANCE, useClass: StableCoinInfoProviderChainInfoCacheInstance },
    ],
    exports: [
        STABLE_COIN_CACHE_INSTANCE,
    ],
})
export class StableCoinInfoProviderCacheInstanceModule {}

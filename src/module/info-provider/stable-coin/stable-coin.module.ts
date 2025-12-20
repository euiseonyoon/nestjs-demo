import { Module } from '@nestjs/common';
import { StableCoinInfoProviderStableCoinCacheKeyGenerator } from 'src/application/cache/key.generator/stable-coin/stable-coin.key.generator';
import { STABLE_COIN_CACHE_KEY_GENERATOR, STABLE_COIN_INFO_FETCHER, STABLE_COIN_INFO_PROVIDER } from 'src/module/module.token';

@Module({
    providers: [
        {
            provide: STABLE_COIN_CACHE_KEY_GENERATOR,
            useClass: StableCoinInfoProviderStableCoinCacheKeyGenerator,
        },
    ],
    exports: [
        STABLE_COIN_CACHE_KEY_GENERATOR
    ],
})
export class StableCoinInfoProviderModule {}

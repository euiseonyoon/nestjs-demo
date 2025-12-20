import { Global, Module } from '@nestjs/common';
import { 
    CACHE_REGISTRY, 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME,
    STABLE_COIN_CACHE_INSTANCE,
    STABLE_COIN_CACHE_NAME,
} from '../module.token';
import { CacheRegistry } from 'src/application/cache/registry/cach.registry';
import { AbstractCacheInstance } from 'src/application/cache/cache.instance/provided_port/cache.instance.interface';
import { ICacheRegistry } from 'src/application/cache/registry/provided_port/cache.registry.interface';
import { OneInchInfoProviderCacheInstanceModule } from './1inch.info-provider/cache.instance.module';
import { Token } from 'src/domain/token.class';
import { ChainInfo } from 'src/domain/chain-info.type';
import { StableCoinInfoProviderCacheInstanceModule } from './stable-coin/cache.instance.module';

@Global()
@Module({
    imports : [
        OneInchInfoProviderCacheInstanceModule,
        StableCoinInfoProviderCacheInstanceModule,
    ],
    providers: [
        CacheRegistry,
        {
            provide: CACHE_REGISTRY,
            inject: [
                CacheRegistry,
                ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE,
                ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE,
                STABLE_COIN_CACHE_INSTANCE,
            ], 
            useFactory: (
                cacheRegistry: ICacheRegistry, 
                oneInchInfoProviderTokenCacheInstance: AbstractCacheInstance<string, Token>,
                oneInchInfoProviderChainCacheInstance: AbstractCacheInstance<string, ChainInfo>,
                stableInfoProviderStableCoinCacheInstance: AbstractCacheInstance<string, Set<Token>>,
            ): ICacheRegistry => {
                cacheRegistry.addCacheInstance(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME, oneInchInfoProviderTokenCacheInstance);
                cacheRegistry.addCacheInstance(ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME, oneInchInfoProviderChainCacheInstance);
                cacheRegistry.addCacheInstance(STABLE_COIN_CACHE_NAME, stableInfoProviderStableCoinCacheInstance);
                
                return cacheRegistry;
            }
        },
    ],
    exports: [
        CACHE_REGISTRY
    ],
})
export class CacheModule {}

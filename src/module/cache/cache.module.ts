import { Global, Module } from '@nestjs/common';
import { 
    CACHE_REGISTRY, 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME,
} from '../module.token';
import { CacheRegistry } from 'src/application/cache/registry/cach.registry';
import { AbstractCacheInstance } from 'src/application/cache/cache.instance/provided_port/cache.instance.interface';
import { ICacheRegistry } from 'src/application/cache/registry/provided_port/cache.registry.interface';
import { OneInchInfoProviderCacheInstanceModule } from './1inch.info-provider/cache.instance.module';
import { Token } from 'src/domain/token.class';
import { ChainInfo } from 'src/domain/chain-info.type';

@Global()
@Module({
    imports : [
        OneInchInfoProviderCacheInstanceModule,
    ],
    providers: [
        CacheRegistry,
        {
            provide: CACHE_REGISTRY,
            inject: [
                CacheRegistry,
                ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE,
                ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE,
            ], 
            useFactory: (
                cacheRegistry: ICacheRegistry, 
                oneInchInfoProviderTokenCacheInstance: AbstractCacheInstance<string, Token>,
                oneInchInfoProviderChainCacheInstance: AbstractCacheInstance<string, ChainInfo>,
            ): ICacheRegistry => {
                cacheRegistry.addCacheInstance(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME, oneInchInfoProviderTokenCacheInstance);
                cacheRegistry.addCacheInstance(ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME, oneInchInfoProviderChainCacheInstance);
                
                return cacheRegistry;
            }
        },
    ],
    exports: [
        CACHE_REGISTRY
    ],
})
export class CacheModule {}

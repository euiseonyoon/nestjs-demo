import { Global, Module } from '@nestjs/common';
import { 
    CACHE_REGISTRY, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME,
} from './module.token';
import { CacheRegistry } from 'src/application/cache/registry/cach.registry';
import { AbstractCacheInstance } from 'src/application/cache/cache.instance/provided_port/cache.instance.interface';
import { ICacheRegistry } from 'src/application/cache/registry/provided_port/cache.registry.interface';
import { OneInchInfoProviderCacheModule } from './1inch.info-provider.token-cache.module';

@Global()
@Module({
    imports : [
        OneInchInfoProviderCacheModule,
    ],
    providers: [
        CacheRegistry,
        {
            provide: CACHE_REGISTRY,
            inject: [
                CacheRegistry,
                ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE
            ], 
            useFactory: (
                cacheRegistry: ICacheRegistry, 
                oneInchInfoProviderTokenCacheInstance: AbstractCacheInstance<string, any>,
            ): ICacheRegistry => {
                cacheRegistry.addCacheInstance(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME, oneInchInfoProviderTokenCacheInstance);
                return cacheRegistry;
            }
        },
    ],
    exports: [
        CACHE_REGISTRY
    ],
})
export class CacheModule {}

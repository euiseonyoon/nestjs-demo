import { Global, Module } from '@nestjs/common';
import { 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE,
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_REPO,
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_REPO, 
} from '../../module.token';
import { OneInchInfoProviderTokenCacheRepo } from 'src/application/cache/cache.repository/1inch.info-provider/token.repo';
import { OneInchInfoProviderTokenCacheInstance } from 'src/application/cache/cache.instance/1inch.info-provider/token.cache.instance';
import { OneInchInfoProviderChainInfoCacheRepo } from 'src/application/cache/cache.repository/1inch.info-provider/chain.repo';
import { OneInchInfoProviderChainInfoCacheInstance } from 'src/application/cache/cache.instance/1inch.info-provider/chain.cache.instance';

@Global()
@Module({
    providers: [
        { provide: ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_REPO, useClass: OneInchInfoProviderTokenCacheRepo },
        { provide: ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE, useClass: OneInchInfoProviderTokenCacheInstance },

        { provide: ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_REPO, useClass: OneInchInfoProviderChainInfoCacheRepo },
        { provide: ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE, useClass: OneInchInfoProviderChainInfoCacheInstance },
    ],
    exports: [
        ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE,
        ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE,
    ],
})
export class OneInchInfoProviderCacheInstanceModule {}

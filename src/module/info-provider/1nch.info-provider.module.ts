import { Module } from '@nestjs/common';
import { 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR, 
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
} from '../module.token';
import { OneInchInfoProviderTokenCacheKeyGenerator } from 'src/application/cache/key.generator/1inch.info-provider/token.key.generator';
import { OneInchInfoProviderChainInfoCacheKeyGenerator } from 'src/application/cache/key.generator/1inch.info-provider/chain.key.generator';

@Module({
    providers: [
        {
            provide: ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
            useClass: OneInchInfoProviderTokenCacheKeyGenerator,
        },
        {
            provide: ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
            useClass: OneInchInfoProviderChainInfoCacheKeyGenerator,
        },
    ],
    exports: [
        ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
        ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
    ],
})
export class OneInchInfoProviderModule {}

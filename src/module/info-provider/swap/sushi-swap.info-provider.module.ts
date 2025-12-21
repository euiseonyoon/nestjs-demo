import { Module } from '@nestjs/common';
import { 
    SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
    SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
} from '../../module.token';
import { SushiSwapInfoProviderTokenCacheKeyGenerator } from 'src/application/cache/key.generator/sushi-swap.info-provider/token.key.generator';
import { SushiSwapInfoProviderChainInfoCacheKeyGenerator } from 'src/application/cache/key.generator/sushi-swap.info-provider/chain.key.generator';

@Module({
    providers: [
        {
            provide: SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
            useClass: SushiSwapInfoProviderTokenCacheKeyGenerator,
        },
        {
            provide: SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
            useClass: SushiSwapInfoProviderChainInfoCacheKeyGenerator,
        },
    ],
    exports: [
        SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
        SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
    ],
})
export class SushiSwapInfoProviderModule {}

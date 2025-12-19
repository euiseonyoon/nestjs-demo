import { Module } from '@nestjs/common';
import { HttpClientModule } from '../http-client.module';
import { OneInchInfoProvider } from 'src/application/defi.info-provider/swap/1inch/1inch.info-provider';
import { StargateInfoProvider } from 'src/application/defi.info-provider/bridge/stargate/stargate.info-provider';
import { SushiSwapInfoProvider } from 'src/application/defi.info-provider/swap/sushiswap/sushi-swap.info-provider';
import { PublicClientModule } from '../public-client.module';
import { ONE_INCH_SWAP_INFO_PROVIDER, SUSHI_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER, ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR } from '../module.token';
import { InfoFetcherModule } from '../info-fetcher.module';
import { OneInchInfoProviderTokenCacheKeyGenerator } from 'src/application/cache/key.generator/1inch.info-provider/token.key.generator';
import { OneInchInfoProviderModule } from './1nch.info-provider.module';

@Module({
    imports: [
        HttpClientModule,
        PublicClientModule,
        InfoFetcherModule,
        OneInchInfoProviderModule,
    ],
    providers: [
        {
            provide: ONE_INCH_SWAP_INFO_PROVIDER,
            useClass: OneInchInfoProvider,
        },
        {
            provide: SUSHI_SWAP_INFO_PROVIDER,
            useClass: SushiSwapInfoProvider,
        },
        {
            provide: STARGATE_BRIDGE_INFO_PROVIDER,
            useClass: StargateInfoProvider,
        },
    ],
    exports: [
        ONE_INCH_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER, SUSHI_SWAP_INFO_PROVIDER,
    ],
})
export class InfoProviderModule {}

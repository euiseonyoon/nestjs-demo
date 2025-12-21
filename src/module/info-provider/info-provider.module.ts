import { Module } from '@nestjs/common';
import { HttpClientModule } from '../http-client.module';
import { OneInchInfoProvider } from 'src/application/info-provider/swap/1inch/1inch.info-provider';
import { StargateInfoProvider } from 'src/application/info-provider/bridge/stargate/stargate.info-provider';
import { SushiSwapInfoProvider } from 'src/application/info-provider/swap/sushiswap/sushi-swap.info-provider';
import { PublicClientModule } from '../public-client.module';
import { ONE_INCH_SWAP_INFO_PROVIDER, SUSHI_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER, STABLE_COIN_INFO_PROVIDER } from '../module.token';
import { InfoFetcherModule } from '../info-fetcher.module';
import { OneInchInfoProviderModule } from './swap/1nch.info-provider.module';
import { StableCoinInfoProvider } from 'src/application/stable-coin/info-provider/info-provider';
import { StableCoinInfoProviderModule } from './stable-coin/stable-coin.module';
import { SushiSwapInfoProviderModule } from './swap/sushi-swap.info-provider.module';

@Module({
    imports: [
        HttpClientModule, // TODO: 추후 StargateInfoProvider도 StargateInfoFetcher를 사용하게 되면 삭제한다.
        InfoFetcherModule,
        OneInchInfoProviderModule,
        SushiSwapInfoProviderModule,
        StableCoinInfoProviderModule,
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
        {
            provide: STABLE_COIN_INFO_PROVIDER,
            useClass: StableCoinInfoProvider,
        }
    ],
    exports: [
        ONE_INCH_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER, SUSHI_SWAP_INFO_PROVIDER,
    ],
})
export class InfoProviderModule {}

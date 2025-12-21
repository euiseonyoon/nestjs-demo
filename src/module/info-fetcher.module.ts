import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchInfoFetcher } from 'src/application/info-fetcher/swap/1inch/1inch-swap.info-fetcher';
import { ERC20_INFO_FETCHER, ONE_INCH_INFO_FETCHER, STABLE_COIN_INFO_FETCHER, SUSHI_SWAP_INFO_FETCHER } from './module.token';
import { StableCoinInfoFetcher } from 'src/application/stable-coin/info-fetcher/info-fetcher';
import { SushiSwapInfoFetcher } from 'src/application/info-fetcher/swap/sushi-swap/sushi-swap.info-fetcher';
import { Erc20InfoFetcher } from 'src/application/common/erc20/erc20.info-fetcher';
import { PublicClientModule } from './public-client.module';

@Module({
    imports: [
        HttpClientModule,
        PublicClientModule,
    ],
    providers: [
        {
            provide: ONE_INCH_INFO_FETCHER,
            useClass: OneInchInfoFetcher,
        },
        {
            provide: ERC20_INFO_FETCHER,
            useClass: Erc20InfoFetcher,
        },
        {
            provide: SUSHI_SWAP_INFO_FETCHER,
            useClass: SushiSwapInfoFetcher,
        },
        {
            provide: STABLE_COIN_INFO_FETCHER,
            useClass: StableCoinInfoFetcher,
        },
    ],
    exports: [
        ONE_INCH_INFO_FETCHER,
        ERC20_INFO_FETCHER,
        SUSHI_SWAP_INFO_FETCHER,
        STABLE_COIN_INFO_FETCHER,
    ],
})
export class InfoFetcherModule {}

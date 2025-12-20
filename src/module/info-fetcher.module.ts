import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchInfoFetcher } from 'src/application/defi.info-fetcher/swap/1inch/1inch-swap.info-fetcher';
import { ONE_INCH_INFO_FETCHER, STABLE_COIN_INFO_FETCHER } from './module.token';
import { StableCoinInfoFetcher } from 'src/application/stable-coin/info-fetcher/info-fetcher';

@Module({
    imports: [
        HttpClientModule,
    ],
    providers: [
        {
            provide: ONE_INCH_INFO_FETCHER,
            useClass: OneInchInfoFetcher,
        },
        {
            provide: STABLE_COIN_INFO_FETCHER,
            useClass: StableCoinInfoFetcher,
        },
    ],
    exports: [
        ONE_INCH_INFO_FETCHER,
        STABLE_COIN_INFO_FETCHER,
    ],
})
export class InfoFetcherModule {}

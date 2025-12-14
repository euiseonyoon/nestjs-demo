import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchInfoFetcher } from 'src/application/defi.info-fetcher/swap/1inch/1inch-swap.info-fetcher';
import { ONE_INCH_INFO_FETCHER } from './module.token';

@Module({
    imports: [
        HttpClientModule,
    ],
    providers: [
        {
            provide: ONE_INCH_INFO_FETCHER,
            useClass: OneInchInfoFetcher,
        },
    ],
    exports: [
        ONE_INCH_INFO_FETCHER,
    ],
})
export class InfoFetcherModule {}

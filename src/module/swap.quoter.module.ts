import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { OneInchQuoter } from 'src/application/quoter/swap/1inch/1inch.quoter';
import { SushiSwapQuoter } from 'src/application/quoter/swap/sushiswap/sushi-swap.quoter';
import { ONE_INCH_SWAP_QUOTER, SUSHI_SWAP_QUOTER } from './module.token';
import { InfoFetcherModule } from './info-fetcher.module';

@Module({
    imports: [
        HttpClientModule, 
        InfoProviderModule,
        InfoFetcherModule,
    ],
    providers: [
        {
            provide: ONE_INCH_SWAP_QUOTER,
            useClass: OneInchQuoter
        },
        {
            provide: SUSHI_SWAP_QUOTER,
            useClass: SushiSwapQuoter
        }
    ],
    exports: [
        ONE_INCH_SWAP_QUOTER, SUSHI_SWAP_QUOTER
    ],
})
export class SwapQuoterModule {}

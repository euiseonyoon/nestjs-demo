import { Module } from '@nestjs/common';
import { OneInchService } from '../application/swaps/1inch/1inch-swap.service';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { AbstractSwapService } from 'src/application/swaps/provided_port/swap.interface';
import { SwapQuoterModule } from './swap.quoter.module';
import { SwapAmountGetterModule } from './swap.amount-getter.module';
import { SWAP_SERVICES } from './module.token';

@Module({
    imports: [HttpClientModule, InfoProviderModule, SwapQuoterModule, SwapAmountGetterModule],
    providers: [
        OneInchService,
        {
            provide: SWAP_SERVICES,
            inject: [
                OneInchService, 
            ],
            useFactory: (oneInchSwap): AbstractSwapService[] => [oneInchSwap],
        }
    ],
    exports: [
        SWAP_SERVICES
    ],
})
export class SwapModule {}

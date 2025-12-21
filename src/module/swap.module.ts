import { Module } from '@nestjs/common';
import { OneInchService } from '../application/swaps/1inch/1inch-swap.service';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { AbstractSwapService } from 'src/application/swaps/provided_port/swap.interface';
import { SwapQuoterModule } from './swap.quoter.module';
import { SwapAmountGetterModule } from './swap.amount-getter.module';
import { SWAP_SERVICES } from './module.token';
import { SushiSwapService } from 'src/application/swaps/sushi-swap/sushi-swap.service';

@Module({
    imports: [
        InfoProviderModule,
        SwapQuoterModule, 
        SwapAmountGetterModule,
    ],
    providers: [
        OneInchService,
        SushiSwapService,
        {
            provide: SWAP_SERVICES,
            inject: [
                OneInchService,
                SushiSwapService,
            ],
            useFactory: (oneInchSwap, sushiSwap): AbstractSwapService[] => [oneInchSwap, sushiSwap],
        }
    ],
    exports: [
        SWAP_SERVICES
    ],
})
export class SwapModule {}

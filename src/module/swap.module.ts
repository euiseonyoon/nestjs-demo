import { Module } from '@nestjs/common';
import { OneInchService } from '../application/swaps/1inch/1inch-swap.service';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider.module';
import { ISwapService } from 'src/application/swaps/provided_port/swap.interface';
import { SwapQuoterModule } from './swap.quoter.module';
import { SwapAmountGetterModule } from './swap.amount-getter.module';

export const SWAP_SERVICES = Symbol('SwapServices');

@Module({
    imports: [HttpClientModule, InfoProviderModule, SwapQuoterModule, SwapAmountGetterModule],
    providers: [
        OneInchService,
        {
            provide: SWAP_SERVICES,
            inject: [
                OneInchService, 
            ],
            useFactory: (oneInchSwap): ISwapService[] => [oneInchSwap],
        }
    ],
    exports: [
        SWAP_SERVICES
    ],
})
export class SwapModule {}

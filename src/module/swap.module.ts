import { Module } from '@nestjs/common';
import { OneInchService } from '../application/swaps/1inch/1inch-swap.service';
import { HttpClientModule } from './http-client.module';
// import { SushiSwapService } from 'src/application/swaps/sushi/sushi-swap.service';
import { ISwapService } from 'src/application/swaps/provided_port/swap.interface';

export const SWAP_SERVICES = Symbol('SwapServices');

@Module({
    imports: [HttpClientModule],
    controllers: [],
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

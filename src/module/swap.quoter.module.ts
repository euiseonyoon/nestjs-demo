import { Module } from '@nestjs/common';
import { OneInchService } from '../application/swaps/1inch/1inch-swap.service';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider.module';
// import { SushiSwapService } from 'src/application/swaps/sushi/sushi-swap.service';
import { ISwapService } from 'src/application/swaps/provided_port/swap.interface';
import { OneInchQuoter } from 'src/application/quoter/swap/1inch/1inch.quoter';

export const ONE_INCH_SWAP_QUOTER = Symbol('OneInchSwapQuoter');

@Module({
    imports: [HttpClientModule, InfoProviderModule],
    providers: [
        {
            provide: ONE_INCH_SWAP_QUOTER,
            useClass: OneInchQuoter
        }
    ],
    exports: [
        ONE_INCH_SWAP_QUOTER
    ],
})
export class SwapQuoterModule {}

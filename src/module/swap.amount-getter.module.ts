import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchAmoutGetter as OneInchAmountGetter } from 'src/application/amount-getter/swap/1inch/1inch.amount-getter';
import { InfoProviderModule } from './info-provider.module';

export const ONE_INCH_SWAP_AMOUNT_GETTER = Symbol('OneInchSwapAmountGetter')

@Module({
    imports: [
        HttpClientModule,
        InfoProviderModule,
    ],
    providers: [
        { provide: ONE_INCH_SWAP_AMOUNT_GETTER, useClass: OneInchAmountGetter}
    ],
    exports: [
        ONE_INCH_SWAP_AMOUNT_GETTER
    ],
})
export class SwapAmountGetterModule {}

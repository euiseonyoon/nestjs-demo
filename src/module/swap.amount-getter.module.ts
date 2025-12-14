import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchAmoutGetter as OneInchAmountGetter } from 'src/application/amount-getter/swap/1inch/1inch.amount-getter';
import { InfoProviderModule } from './info-provider.module';
import { SushiSwapAmoutGetter } from 'src/application/amount-getter/swap/sushiswap/sushiswap.amount-getter';
import { TxModule } from './tx.module';
import { ONE_INCH_SWAP_AMOUNT_GETTER, SUSHI_SWAP_AMOUNT_GETTER } from './module.token';

@Module({
    imports: [
        HttpClientModule,
        InfoProviderModule,
        TxModule,
    ],
    providers: [
        { provide: ONE_INCH_SWAP_AMOUNT_GETTER, useClass: OneInchAmountGetter},
        { provide: SUSHI_SWAP_AMOUNT_GETTER, useClass: SushiSwapAmoutGetter}
    ],
    exports: [
        ONE_INCH_SWAP_AMOUNT_GETTER,
        SUSHI_SWAP_AMOUNT_GETTER,
    ],
})
export class SwapAmountGetterModule {}

import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { TxModule } from './tx.module';
import { StargateAmountGetter } from 'src/application/amount-getter/bridge/stargate/stargate.amount-getter';
import { LayerZeroModule } from './layer-zero.module';

export const STARGATE_BRIDGE_AMOUNT_GETTER = Symbol('StargateAmountGetter')

@Module({
    imports: [
        LayerZeroModule,
    ],
    providers: [
        { provide: STARGATE_BRIDGE_AMOUNT_GETTER, useClass: StargateAmountGetter}
    ],
    exports: [
        STARGATE_BRIDGE_AMOUNT_GETTER
    ],
})
export class BridgeAmountGetterModule {}

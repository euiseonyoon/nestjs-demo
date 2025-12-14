import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { TxModule } from './tx.module';
import { StargateAmountGetter } from 'src/application/amount-getter/bridge/stargate/stargate.amount-getter';
import { LayerZeroModule } from './layer-zero.module';
import { STARGATE_BRIDGE_AMOUNT_GETTER } from './module.token';

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

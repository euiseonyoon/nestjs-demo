import { Module } from '@nestjs/common';
import { StargateService } from 'src/application/bridges/stargate/stargate.service';
import { AbstractBridgeService } from 'src/application/bridges/provided_port/abstract.bridge.service';
import { BridgeAmountGetterModule } from './bridge.amount-getter.module';
import { InfoProviderModule } from './info-provider.module';
import { BridgeQuoteModule } from './bridge.quoter.module';
import { BRIDGE_SERVICES } from './module.token';

@Module({
    imports: [
        BridgeAmountGetterModule,
        InfoProviderModule,
        BridgeQuoteModule,
    ],
    controllers: [],
    providers: [
        StargateService,
        {
            provide: BRIDGE_SERVICES,
            inject: [
                StargateService, 
            ],
            useFactory: (stargateBridge): AbstractBridgeService[] => [stargateBridge],
        }
    ],
    exports: [
        BRIDGE_SERVICES
    ],
})
export class BridgeModule {}

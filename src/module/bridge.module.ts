import { Module } from '@nestjs/common';
import { StargateService } from 'src/application/bridges/stargate/stargate.service';
import { IBridgeService } from 'src/application/bridges/provided_port/bridge.interface';
import { BridgeAmountGetterModule } from './bridge.amount-getter.module';
import { InfoProviderModule } from './info-provider.module';
import { BridgeQuoteModule } from './bridge.quoter.module';

export const BRIDGE_SERVICES = Symbol('BridgeServices');

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
            useFactory: (stargateBridge): IBridgeService[] => [stargateBridge],
        }
    ],
    exports: [
        BRIDGE_SERVICES
    ],
})
export class BridgeModule {}

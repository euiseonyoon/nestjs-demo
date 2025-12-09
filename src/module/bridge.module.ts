import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { StargateService } from 'src/application/bridges/stargate/stargate.service';
import { IBridgeService } from 'src/application/bridges/provided_port/bridge.interface';
import { BridgeSubModule } from './bridge-sub.module';
import { InfoProviderModule } from './info-provider.module';
import { BridgeQuoteModule } from './bridge.quoter.module';

export const BRIDGE_SERVICES = Symbol('BridgeServices');

@Module({
    imports: [
        BridgeSubModule,
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

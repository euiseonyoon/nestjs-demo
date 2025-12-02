import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { StargateService } from 'src/application/bridges/stargate/stargate.service';
import { IBridgeService } from 'src/application/bridges/bridge.interface';
import { TxModule } from './tx.module';

export const BRIDGE_SERVICES = 'BridgeServices';

@Module({
    imports: [
        HttpClientModule,
        TxModule,
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

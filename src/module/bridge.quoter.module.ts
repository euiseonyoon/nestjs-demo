import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { StargateQuoter } from 'src/application/quoter/bridge/stargate/stargate.quoter';
import { STARGATE_QUOTER } from './module.token';

@Module({
    imports: [HttpClientModule, InfoProviderModule],
    providers: [
        {
            provide: STARGATE_QUOTER,
            useClass: StargateQuoter
        }
    ],
    exports: [
        STARGATE_QUOTER
    ],
})
export class BridgeQuoteModule {}

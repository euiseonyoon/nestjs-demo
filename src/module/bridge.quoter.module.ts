import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { InfoProviderModule } from './info-provider.module';
import { StargateQuoter } from 'src/application/quoter/bridge/stargate/stargate.quoter';

export const STARGATE_QUOTER = Symbol('StargateQuoter');

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

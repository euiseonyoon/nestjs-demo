import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchInfoProvider } from 'src/application/defi.info-provider/swap/1inch/1inch.info-provider';
import { StargateInfoProvider } from 'src/application/defi.info-provider/bridge/stargate/stargate.info-provider';

export const ONE_INCH_SWAP_INFO_PROVIDER = Symbol('OneInchSwapInfoProvider');
export const STARGATE_BRIDGE_INFO_PROVIDER = Symbol('StargateInfoProvider');

@Module({
    imports: [
        HttpClientModule,
    ],
    providers: [
        {
            provide: ONE_INCH_SWAP_INFO_PROVIDER,
            useClass: OneInchInfoProvider,
        },
        {
            provide: STARGATE_BRIDGE_INFO_PROVIDER,
            useClass: StargateInfoProvider,
        },
    ],
    exports: [
        ONE_INCH_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER,
    ],
})
export class InfoProviderModule {}

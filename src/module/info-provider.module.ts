import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { OneInchInfoProvider } from 'src/application/defi.info-provider/swap/1inch/1inch.info-provider';
import { StargateInfoProvider } from 'src/application/defi.info-provider/bridge/stargate/stargate.info-provider';
import { SushiSwapInfoProvider } from 'src/application/defi.info-provider/swap/sushiswap/sushi-swap.info-provider';
import { PublicClientModule } from './public-client.module';

export const ONE_INCH_SWAP_INFO_PROVIDER = Symbol('OneInchSwapInfoProvider');
export const SUSHI_SWAP_INFO_PROVIDER = Symbol('SushiSwapInfoProvider');
export const STARGATE_BRIDGE_INFO_PROVIDER = Symbol('StargateInfoProvider');

@Module({
    imports: [
        HttpClientModule,
        PublicClientModule,
    ],
    providers: [
        {
            provide: ONE_INCH_SWAP_INFO_PROVIDER,
            useClass: OneInchInfoProvider,
        },
        {
            provide: SUSHI_SWAP_INFO_PROVIDER,
            useClass: SushiSwapInfoProvider,
        },
        {
            provide: STARGATE_BRIDGE_INFO_PROVIDER,
            useClass: StargateInfoProvider,
        },
    ],
    exports: [
        ONE_INCH_SWAP_INFO_PROVIDER, STARGATE_BRIDGE_INFO_PROVIDER, SUSHI_SWAP_INFO_PROVIDER,
    ],
})
export class InfoProviderModule {}

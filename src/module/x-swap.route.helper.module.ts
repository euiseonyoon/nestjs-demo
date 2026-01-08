import { Module } from '@nestjs/common';
import { XSwapRouteSwapHelper } from 'src/application/x-swap.routing/finder/swap/helper/x-swap.route.swap.helper';
import { XSwapRouteBridgeHelper } from 'src/application/x-swap.routing/finder/bridge/helper/x-swap.route.bridge.helper';
import { SwapModule } from './swap.module';
import { BridgeModule } from './bridge.module';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { X_SWAP_ROUTE_SWAP_HELPER, X_SWAP_ROUTE_BRIDGE_HELPER } from './module.token';

@Module({
    imports: [
        SwapModule,
        BridgeModule,
        InfoProviderModule,
    ],
    providers: [
        { provide: X_SWAP_ROUTE_SWAP_HELPER, useClass: XSwapRouteSwapHelper },
        { provide: X_SWAP_ROUTE_BRIDGE_HELPER, useClass: XSwapRouteBridgeHelper },
    ],
    exports: [
        X_SWAP_ROUTE_SWAP_HELPER,
        X_SWAP_ROUTE_BRIDGE_HELPER,
    ]
})
export class XSwapRouteHelperModule {}

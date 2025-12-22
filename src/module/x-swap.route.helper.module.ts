import { Module } from '@nestjs/common';
import { XSwapRouteSwapHelper } from 'src/application/x-swap.routing/finder/swap/helper/x-swap.route.swap.helper';
import { SwapModule } from './swap.module';
import { InfoProviderModule } from './info-provider/info-provider.module';
import { X_SWAP_ROUTE_SWAP_HELPER } from './module.token';

@Module({
    imports: [
        SwapModule,
        InfoProviderModule,
    ],
    providers: [
        { provide: X_SWAP_ROUTE_SWAP_HELPER, useClass: XSwapRouteSwapHelper},
    ],
    exports: [
        X_SWAP_ROUTE_SWAP_HELPER,
    ]
})
export class XSwapRouteHelperModule {}

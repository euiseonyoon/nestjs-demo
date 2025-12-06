import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { TxModule } from './tx.module';
import { LayerZeroService } from 'src/application/layer-zero/layer-zero.service';

export const LAYER_ZERO_SERVICE = Symbol('LayerZeroService');

@Module({
    imports: [
        HttpClientModule,
        TxModule,
    ],
    controllers: [],
    providers: [
        { provide: LAYER_ZERO_SERVICE, useClass: LayerZeroService}
    ],
    exports: [
        LAYER_ZERO_SERVICE
    ],
})
export class BridgeSubModule {}

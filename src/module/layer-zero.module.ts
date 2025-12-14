import { Module } from '@nestjs/common';
import { HttpClientModule } from './http-client.module';
import { TxModule } from './tx.module';
import { LayerZeroService } from 'src/application/layer-zero/layer-zero.service';
import { LAYER_ZERO_SERVICE } from './module.token';

@Module({
    imports: [
        HttpClientModule,
        TxModule,
    ],
    providers: [
        { provide: LAYER_ZERO_SERVICE, useClass: LayerZeroService},
    ],
    exports: [
        LAYER_ZERO_SERVICE
    ],
})
export class LayerZeroModule {}

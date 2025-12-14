import { Module } from '@nestjs/common';
import { TxService } from 'src/application/transaction/tx.service';
import { PublicClientModule } from './public-client.module';
import { TX_SERVICE } from './module.token';

@Module({
    imports: [PublicClientModule],
    controllers: [],
    providers: [{ provide: TX_SERVICE, useClass: TxService }],
    exports: [
        TX_SERVICE
    ]
})
export class TxModule {}

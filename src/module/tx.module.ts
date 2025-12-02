import { Module } from '@nestjs/common';
import { TxService } from 'src/application/transaction/tx.service';
import { PublicClientModule } from './public-client.module';

export const TX_SERVICE = Symbol('TxService');

@Module({
    imports: [PublicClientModule],
    controllers: [],
    providers: [{ provide: TX_SERVICE, useClass: TxService }],
    exports: [
        TX_SERVICE
    ]
})
export class TxModule {}

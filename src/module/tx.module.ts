import { Module } from '@nestjs/common';
import { TxServiceImpl } from 'src/application/transaction/tx.service';
import { PublicClientModule } from './public-client.module';

export const TX_SERVICE = 'TxService';

@Module({
    imports: [PublicClientModule],
    controllers: [],
    providers: [{ provide: TX_SERVICE, useClass: TxServiceImpl }],
    exports: [
        TX_SERVICE
    ]
})
export class TxModule {}

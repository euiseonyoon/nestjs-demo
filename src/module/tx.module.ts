import { Module } from '@nestjs/common';
import { TxController } from 'src/adapter/primary/transaction/tx.controller';
import { TxServiceImpl } from 'src/application/transaction/tx.service';
import { PublicClientModule } from './public-client.module';

export const TX_SERVICE = 'TxService';

@Module({
    imports: [PublicClientModule],
    controllers: [TxController],
    providers: [{ provide: TX_SERVICE, useClass: TxServiceImpl }],
    exports: [
        TX_SERVICE
    ]
})
export class TxModule {}

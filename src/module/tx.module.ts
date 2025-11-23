import { Module } from '@nestjs/common';
import { TxController } from 'src/adapter/primary/transaction/tx.controller';
import { TxServiceImpl } from 'src/application/transaction/tx.service';
import { PublicClientModule } from './public-client.module';

@Module({
    imports: [PublicClientModule],
    controllers: [TxController],
    providers: [{ provide: 'TxService', useClass: TxServiceImpl }],
})
export class TxModule {}

import { Module } from '@nestjs/common';
import { TxModule } from './tx.module';

@Module({
    imports: [TxModule],
    controllers: [],
    providers: [],
})
export class AppModule {}

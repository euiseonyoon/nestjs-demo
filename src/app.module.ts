import { Module } from '@nestjs/common';
import { TxModule } from './module/tx.module';

@Module({
  imports: [TxModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ExampleApiModule } from './example-api.module';
import { TxModule } from './tx.module';

@Module({
    imports: [TxModule, ExampleApiModule],
    controllers: [],
    providers: [],
})
export class AppModule {}

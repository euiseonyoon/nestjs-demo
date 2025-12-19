import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwapModule } from './swap.module';
import { TxModule } from './tx.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BridgeModule } from './bridge.module';
import { CacheModule } from './cache/cache.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ScheduleModule.forRoot({
            cronJobs: true,  // @Cron() 사용가능 
            intervals: false, // @Interval 사용 불가능 
            timeouts: false, // @Timeout 사용 불가능
        }),
        CacheModule,
        TxModule,
        SwapModule,
        BridgeModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

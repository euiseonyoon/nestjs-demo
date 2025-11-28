import { Module } from '@nestjs/common';
import { ExampleApiController } from '../adapter/primary/example-api/example-api.controller';
import { ExampleApiService } from '../application/example-api/example-api.service';
import { HttpClientModule } from './http-client.module';

@Module({
    imports: [HttpClientModule],
    controllers: [ExampleApiController],
    providers: [ExampleApiService],
    exports: [ExampleApiService],
})
export class ExampleApiModule {}

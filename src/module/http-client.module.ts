import { Module } from '@nestjs/common';
import { AxiosHttpClientAdapter } from '../adapter/secondary/http-client/axios-http-client.adapter';

@Module({
    providers: [
        {
            provide: 'HttpClient',
            useClass: AxiosHttpClientAdapter,
        },
    ],
    exports: ['HttpClient'],
})
export class HttpClientModule {}

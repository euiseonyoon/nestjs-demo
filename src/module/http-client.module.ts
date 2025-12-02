import { Module } from '@nestjs/common';
import { AxiosHttpClientAdapter } from '../adapter/secondary/http-client/axios-http-client.adapter';

export const HTTP_CLIENT = "HttpClient"

@Module({
    providers: [
        {
            provide: HTTP_CLIENT,
            useClass: AxiosHttpClientAdapter,
        },
    ],
    exports: [
        HTTP_CLIENT,
    ],
})
export class HttpClientModule {}

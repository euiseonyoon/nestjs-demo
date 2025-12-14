import { Module } from '@nestjs/common';
import { AxiosHttpClientAdapter } from '../adapter/secondary/http-client/axios-http-client.adapter';
import { AxiosErrorResponseHandler } from 'src/infrastructure/axios.error-handler/axios.erorr-response.handler';
import { HTTP_CLIENT, AXIOS_ERROR_RESPONSE_HANDLER } from './module.token';

@Module({
    providers: [
        AxiosErrorResponseHandler,
        {
            provide: AXIOS_ERROR_RESPONSE_HANDLER,
            useExisting: AxiosErrorResponseHandler
        },
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

import { NestFactory } from '@nestjs/core';
import { ResponseBigIntToStringInterceptor } from './adapter/common/interceptor/response-big-int-to-string/response-big-int-to-string.interceptor';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(new ResponseBigIntToStringInterceptor());

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

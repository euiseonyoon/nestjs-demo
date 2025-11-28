# HTTP Client Adapter

External API 호출을 위한 HTTP Client 어댑터입니다.

## 구조

### Required Port (Application Layer)
- `src/application/common/required_port/http-client.interface.ts`: HTTP 클라이언트 인터페이스 정의

### Adapter Implementation (Secondary Adapter)
- `src/adapter/secondary/http-client/axios-http-client.adapter.ts`: Axios 기반 HTTP 클라이언트 구현
- `src/adapter/secondary/http-client/axios-http-client.adapter.spec.ts`: 테스트 파일

### Module
- `src/module/http-client.module.ts`: HttpClient 모듈 (의존성 주입)

## 사용 방법

### 1. 모듈 임포트

사용하려는 모듈에서 `HttpClientModule`을 import 합니다:

```typescript
import { Module } from '@nestjs/common';
import { HttpClientModule } from '../module/http-client.module';

@Module({
    imports: [HttpClientModule],
    // ...
})
export class YourModule {}
```

### 2. 서비스에서 HttpClient 주입

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { HttpClient } from '../application/common/required_port/http-client.interface';

@Injectable()
export class YourService {
    constructor(
        @Inject('HttpClient')
        private readonly httpClient: HttpClient,
    ) {}

    async callExternalApi() {
        // GET 요청
        const response = await this.httpClient.get('https://api.example.com/data');
        console.log(response.data);

        // POST 요청
        const postResponse = await this.httpClient.post(
            'https://api.example.com/users',
            { name: 'John', email: 'john@example.com' }
        );
        console.log(postResponse.data);

        // 헤더 및 파라미터 포함
        const customResponse = await this.httpClient.get(
            'https://api.example.com/items',
            {
                headers: { 'Authorization': 'Bearer token' },
                params: { page: 1, limit: 10 },
                timeout: 5000,
            }
        );
        console.log(customResponse.data);
    }
}
```

### 3. 사용 가능한 메서드

- `get<T>(url, config?)`: GET 요청
- `post<T>(url, data?, config?)`: POST 요청
- `put<T>(url, data?, config?)`: PUT 요청
- `delete<T>(url, config?)`: DELETE 요청
- `patch<T>(url, data?, config?)`: PATCH 요청
- `request<T>(config)`: 커스텀 요청

## 설정 옵션

`HttpRequestConfig` 인터페이스를 통해 다음 옵션을 설정할 수 있습니다:

- `url`: 요청 URL
- `method`: HTTP 메서드
- `headers`: 요청 헤더
- `params`: URL 쿼리 파라미터
- `data`: 요청 바디 데이터
- `timeout`: 타임아웃 (밀리초, 기본값: 30000)

## 인터셉터

자동으로 요청/응답 로깅이 설정되어 있습니다. 추가 인터셉터가 필요한 경우 `AxiosHttpClientAdapter` 클래스를 수정하세요.

## 테스트

```bash
npm test -- axios-http-client.adapter.spec.ts
```

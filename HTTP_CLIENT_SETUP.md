# HTTP Client 외부 API 호출 기능 구현

## 개요

Hexagonal Architecture 패턴에 따라 adapter/secondary에 외부 API 호출 기능을 구현했습니다.

## 구조

```
src/
├── application/
│   ├── common/
│   │   └── required_port/
│   │       └── http-client.interface.ts        # Port 인터페이스 정의
│   └── example-api/
│       └── example-api.service.ts               # 예제 서비스 (HttpClient 사용)
│
├── adapter/
│   ├── primary/
│   │   └── example-api/
│   │       └── example-api.controller.ts        # 예제 컨트롤러
│   └── secondary/
│       └── http-client/
│           ├── axios-http-client.adapter.ts     # HttpClient 구현체 (Axios 기반)
│           ├── axios-http-client.adapter.spec.ts # 테스트
│           └── README.md                         # 사용법 문서
│
└── module/
    ├── http-client.module.ts                     # HttpClient 모듈
    ├── example-api.module.ts                     # 예제 API 모듈
    └── app.module.ts                             # 메인 모듈 (ExampleApiModule 추가됨)
```

## 구현된 기능

### 1. Required Port (Application Layer)
**파일**: `src/application/common/required_port/http-client.interface.ts`

인터페이스 정의:
- `HttpClient`: HTTP 클라이언트 인터페이스
- `HttpRequestConfig`: 요청 설정
- `HttpResponse`: 응답 타입

### 2. Adapter Implementation (Secondary Adapter)
**파일**: `src/adapter/secondary/http-client/axios-http-client.adapter.ts`

기능:
- Axios 기반 HTTP 클라이언트 구현
- 요청/응답 인터셉터 (로깅)
- GET, POST, PUT, DELETE, PATCH 메서드 지원
- 커스텀 헤더, 파라미터, 타임아웃 설정 지원

### 3. Module
**파일**: `src/module/http-client.module.ts`

- `HttpClient` 토큰으로 의존성 주입 제공
- 다른 모듈에서 import하여 사용 가능

## 사용 방법

### 기본 사용법

1. **모듈 import**
```typescript
import { Module } from '@nestjs/common';
import { HttpClientModule } from '../module/http-client.module';

@Module({
    imports: [HttpClientModule],
    // ...
})
export class YourModule {}
```

2. **서비스에 주입**
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { HttpClient } from '../application/common/required_port/http-client.interface';

@Injectable()
export class YourService {
    constructor(
        @Inject('HttpClient')
        private readonly httpClient: HttpClient,
    ) {}

    async callApi() {
        // GET 요청
        const response = await this.httpClient.get('https://api.example.com/data');
        return response.data;
    }
}
```

### 사용 가능한 메서드

```typescript
// GET 요청
await httpClient.get<T>(url, config?);

// POST 요청
await httpClient.post<T>(url, data?, config?);

// PUT 요청
await httpClient.put<T>(url, data?, config?);

// DELETE 요청
await httpClient.delete<T>(url, config?);

// PATCH 요청
await httpClient.patch<T>(url, data?, config?);

// 커스텀 요청
await httpClient.request<T>({
    url: 'https://api.example.com/endpoint',
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' },
    params: { page: 1 },
    timeout: 5000,
});
```

## 예제 API

프로젝트에 JSONPlaceholder API를 사용한 예제가 포함되어 있습니다.

### 예제 엔드포인트

서버를 시작하고 다음 엔드포인트로 테스트할 수 있습니다:

```bash
# 사용자 목록 조회
GET http://localhost:3000/example-api/users

# 특정 사용자 조회
GET http://localhost:3000/example-api/users/1

# 사용자의 포스트 조회
GET http://localhost:3000/example-api/posts/user/1

# 포스트 생성
POST http://localhost:3000/example-api/posts
Content-Type: application/json
{
  "title": "Test Post",
  "body": "This is a test post",
  "userId": 1
}

# 포스트 수정
PUT http://localhost:3000/example-api/posts/1
Content-Type: application/json
{
  "title": "Updated Title",
  "body": "Updated body"
}

# 포스트 삭제
DELETE http://localhost:3000/example-api/posts/1

# 커스텀 요청 예제
GET http://localhost:3000/example-api/custom-request
```

## 테스트

```bash
# HTTP 클라이언트 어댑터 테스트
npm test -- axios-http-client.adapter.spec.ts
```

테스트 결과:
```
✓ should be defined
✓ should make a GET request
✓ should make a POST request

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## 설정 옵션

### HttpRequestConfig

```typescript
interface HttpRequestConfig {
    url: string;                           // 요청 URL
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;      // 커스텀 헤더
    params?: Record<string, any>;          // URL 쿼리 파라미터
    data?: any;                            // 요청 바디
    timeout?: number;                      // 타임아웃 (밀리초, 기본: 30000)
}
```

### 인터셉터

현재 구현된 인터셉터:
- **요청 인터셉터**: 요청 정보 로깅
- **응답 인터셉터**: 응답 정보 로깅 및 에러 핸들링

추가 인터셉터가 필요한 경우 `AxiosHttpClientAdapter` 클래스의 `setupInterceptors()` 메서드를 수정하세요.

## 실제 프로젝트에서 사용하기

예제 API 모듈은 참고용입니다. 실제 프로젝트에서는:

1. **예제 모듈 제거** (선택사항):
   - `src/application/example-api/` 디렉토리
   - `src/adapter/primary/example-api/` 디렉토리
   - `src/module/example-api.module.ts`
   - `src/module/app.module.ts`에서 `ExampleApiModule` import 제거

2. **실제 외부 API 서비스 생성**:
   - `HttpClientModule`을 import
   - `HttpClient`를 주입받아 사용
   - 필요에 따라 에러 핸들링 및 재시도 로직 추가

## 의존성

- `axios`: HTTP 클라이언트 라이브러리 (자동으로 설치됨)

## 아키텍처 준수

이 구현은 Hexagonal Architecture의 핵심 원칙을 따릅니다:

1. **Port (Required Port)**: `http-client.interface.ts`에서 인터페이스 정의
2. **Adapter (Secondary Adapter)**: `axios-http-client.adapter.ts`에서 구현
3. **Dependency Inversion**: Application 레이어는 인터페이스에만 의존
4. **Module**: 의존성 주입을 통한 느슨한 결합

이로써 HTTP 클라이언트 구현체를 쉽게 교체할 수 있으며, 테스트 시 Mock 객체로 대체할 수 있습니다.

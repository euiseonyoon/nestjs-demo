import { HttpResponse } from "src/domain/http.response";

export const DEFAULT_MAX_ATTEMPTS = 3;
export const MAX_ALLOWED_ATTEMPTS = 10;
export const DEFAULT_BASE_DELAY = 1000; // 1초
export const MAX_DELAY_MS = 10_000; // 10초

export class RetryConfig {
    public maxAttempts: number;
    public baseDelay: number;
    public delayExponential: boolean;

    constructor(
        config?: Partial<{
            maxAttempts: number,
            baseDelay: number,
            delayExponential: boolean,
        }>
    ) {
        const attempts = config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

        if (attempts > MAX_ALLOWED_ATTEMPTS) {
            this.maxAttempts = MAX_ALLOWED_ATTEMPTS;
        } else if (attempts <= 0 || !Number.isInteger(attempts)) {
            this.maxAttempts = DEFAULT_MAX_ATTEMPTS; 
        } else {
            this.maxAttempts = attempts;
        }

        this.baseDelay = config?.baseDelay ?? DEFAULT_BASE_DELAY;
        if (this.baseDelay <= 0 || !Number.isInteger(this.baseDelay)) {
            this.baseDelay = DEFAULT_BASE_DELAY; 
        }

        this.delayExponential = config?.delayExponential ?? true;
    }

    public calculateRetryDelay(attempt: number): number {
        if(!this.delayExponential) return this.baseDelay
        return Math.min(MAX_DELAY_MS, this.baseDelay * Math.pow(2, attempt));
    }
}

export interface HttpRequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    timeout?: number;
    retryConfig?: RetryConfig
}

export interface IHttpClient {
    request<T = any, E = any>(config: HttpRequestConfig): Promise<HttpResponse<T, E>>;

    get<T = any, E = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>>;

    post<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>>;

    put<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>>;

    delete<T = any, E = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>>;

    patch<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>>;
}

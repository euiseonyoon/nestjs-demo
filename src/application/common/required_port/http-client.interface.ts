export interface HttpRequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    timeout?: number;
}

export interface HttpResponse<T = any, E = any> {
    data: T;
    error?: E;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    isError: boolean;
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

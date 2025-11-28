export interface HttpRequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    timeout?: number;
}

export interface HttpResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

export interface HttpClient {
    request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
    get<T = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>>;
    post<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>>;
    put<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>>;
    delete<T = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>>;
    patch<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>>;
}

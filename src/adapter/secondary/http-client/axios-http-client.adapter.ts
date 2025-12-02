import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
    IHttpClient,
    HttpRequestConfig,
    HttpResponse,
} from '../../../application/common/required_port/http-client.interface';

@Injectable()
export class AxiosHttpClientAdapter implements IHttpClient {
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log(
                    `HTTP Request: ${config.method?.toUpperCase()} ${config.url}`,
                );
                return config;
            },
            (error) => {
                console.error('HTTP Request Error:', error);
                return Promise.reject(error);
            },
        );

        this.axiosInstance.interceptors.response.use(
            (response) => {
                console.log(
                    `HTTP Response: ${response.status} ${response.config.url}`,
                );
                return response;
            },
            (error) => {
                console.error(
                    'HTTP Response Error:',
                    error.response?.status,
                    error.config?.url,
                );
                return Promise.reject(error);
            },
        );
    }


    private mapRequestConfig(config: HttpRequestConfig): AxiosRequestConfig {
        return {
            url: config.url,
            method: config.method,
            headers: config.headers,
            params: config.params,
            data: config.data,
            timeout: config.timeout,
        };
    }

    async request<T = any, E = any>(
        config: HttpRequestConfig,
    ): Promise<HttpResponse<T, E>> {
        try {
            const axiosConfig = this.mapRequestConfig(config);
            const response = await this.axiosInstance.request<T>(axiosConfig);

            // 성공 응답
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as Record<string, string>,
                isError: false,
            };
        } catch (error) {
            // Axios 에러 처리
            if (axios.isAxiosError(error) && error.response) {
                // 4XX, 5XX 응답을 받았지만 예외로 처리된 경우
                return {
                    data: {} as T,
                    error: error.response.data as E,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers as Record<string, string>,
                    isError: true,
                };
            }

            // 네트워크 에러 등 다른 종류의 에러
            throw error;
        }
    }

    async get<T = any, E = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'GET',
        });
    }

    async post<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'POST',
            data,
        });
    }

    async put<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'PUT',
            data,
        });
    }

    async delete<T = any, E = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'DELETE',
        });
    }

    async patch<T = any, E = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'PATCH',
            data,
        });
    }
}

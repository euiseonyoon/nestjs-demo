import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
    HttpClient,
    HttpRequestConfig,
    HttpResponse,
} from '../../../application/common/required_port/http-client.interface';

@Injectable()
export class AxiosHttpClientAdapter implements HttpClient {
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

    private mapAxiosResponse<T>(
        axiosResponse: AxiosResponse<T>,
    ): HttpResponse<T> {
        return {
            data: axiosResponse.data,
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
            headers: axiosResponse.headers as Record<string, string>,
        };
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

    async request<T = any>(
        config: HttpRequestConfig,
    ): Promise<HttpResponse<T>> {
        const axiosConfig = this.mapRequestConfig(config);
        const response = await this.axiosInstance.request<T>(axiosConfig);
        return this.mapAxiosResponse(response);
    }

    async get<T = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            ...config,
            url,
            method: 'GET',
        });
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            ...config,
            url,
            method: 'POST',
            data,
        });
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            ...config,
            url,
            method: 'PUT',
            data,
        });
    }

    async delete<T = any>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            ...config,
            url,
            method: 'DELETE',
        });
    }

    async patch<T = any>(
        url: string,
        data?: any,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            ...config,
            url,
            method: 'PATCH',
            data,
        });
    }
}

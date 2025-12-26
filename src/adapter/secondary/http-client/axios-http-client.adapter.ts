import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
    type IHttpClient,
    type HttpRequestConfig,
} from '../../../application/common/required_port/http-client.interface';
import { HttpResponse } from 'src/domain/http.response';
import { AXIOS_ERROR_RESPONSE_HANDLER } from 'src/module/module.token';
import { type IAxiosErrorResponseHanlder } from './required_port/axios.error-response-handler';
import { z } from 'zod';

@Injectable()
export class AxiosHttpClientAdapter implements IHttpClient {
    private readonly axiosInstance: AxiosInstance;
    readonly DEFAULT_TIMEOUT_MS = 10_000;

    constructor(
        @Inject(AXIOS_ERROR_RESPONSE_HANDLER)
        private readonly axiosErrorHandler: IAxiosErrorResponseHanlder
    ) {
        this.axiosInstance = axios.create({
            timeout: this.DEFAULT_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupLoggingInterceptors();
    }

    private setupLoggingInterceptors(): void {
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


    async request<T = unknown, E = unknown>(
        config: HttpRequestConfig,
    ): Promise<HttpResponse<T, E>> {
        const axiosConfig = this.mapRequestConfig(config);
        const maxRetries = config.retryConfig?.maxAttempts ?? 0;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.axiosInstance.request<T>(axiosConfig);

                // 런타임 검증 (validation 옵션이 있을 경우)
                let validatedData: unknown = response.data;
                if (config.validation?.responseSchema) {
                    validatedData = config.validation.responseSchema.parse(response.data);
                }

                return {
                    data: validatedData as T,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers as Record<string, string>,
                    isErrorResponse: false,
                    isNetworkError: false,
                };

            } catch (error) {
                // Zod validation 에러 처리
                if (error instanceof z.ZodError) {
                    console.error('Response validation failed:', {
                        url: axiosConfig.url,
                        method: axiosConfig.method,
                        errors: error.issues,
                    });
                    throw new Error(
                        `API response validation failed: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
                    );
                }

                if (axios.isAxiosError(error)) {
                    if (error.response !== undefined) {
                        // 5XX에러나 4XX에러를 핸들링 한다.

                        // 에러 응답 검증 (errorSchema가 있을 경우)
                        if (config.validation?.errorSchema && error.response.data) {
                            try {
                                error.response.data = config.validation.errorSchema.parse(error.response.data);
                            } catch (validationError) {
                                if (validationError instanceof z.ZodError) {
                                    console.error('Error response validation failed:', {
                                        url: axiosConfig.url,
                                        method: axiosConfig.method,
                                        status: error.response.status,
                                        errors: validationError.issues,
                                    });
                                    throw new Error(
                                        `API error response validation failed: ${validationError.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
                                    );
                                }
                                throw validationError;
                            }
                        }

                        // result가 null이 아니면 재시도를 하지 않아야 된다고 판단, HttpBadResponse<E>를 반환한다
                        // result가 null이면, 재시도가 가능하다고 판단, 이미 sleep을 했기때문에 continue한다.
                        const result = await this.axiosErrorHandler.handleBadResponse<E>(error.response, config.retryConfig, attempt, maxRetries)
                        if(result !== null) {
                            return result;
                        }
                        continue;
                    } else {
                        // result가 null이 아니면 재시도를 하지 않아야 된다고 판단, HttpNetworkErrorResponse 반환한다
                        // result가 null이면, 재시도가 가능하다고 판단, 이미 sleep을 했기때문에 continue한다.
                        const result = await this.axiosErrorHandler.handleNoResponse(error, attempt, maxRetries, config.retryConfig)
                        if(result !== null) {
                            return result;
                        }
                        continue;
                    }
                }

                console.error('Unexpected error in HTTP client:', error);
                throw error;
            }
        }
        
        throw new Error('Max retries exceeded');
    }

    async get<T = unknown, E = unknown>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'GET',
        });
    }

    async post<T = unknown, E = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'POST',
            data,
        });
    }

    async put<T = unknown, E = unknown>(
        url: string,
        data?: unknown,
        config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'PUT',
            data,
        });
    }

    async delete<T = unknown, E = unknown>(
        url: string,
        config?: Omit<HttpRequestConfig, 'url' | 'method'>,
    ): Promise<HttpResponse<T, E>> {
        return this.request<T, E>({
            ...config,
            url,
            method: 'DELETE',
        });
    }

    async patch<T = unknown, E = unknown>(
        url: string,
        data?: unknown,
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
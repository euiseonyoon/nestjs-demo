import { Injectable } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
import { IAxiosErrorResponseHanlder } from "src/adapter/secondary/http-client/required_port/axios.error-response-handler";
import { MAX_DELAY_MS, RetryConfig } from "src/application/common/required_port/http-client.interface";
import { HttpBadResponse, HttpNetworkErrorResponse } from "src/domain/http.response";

@Injectable()
export class AxiosErrorResponseHandler implements IAxiosErrorResponseHanlder {
    private readonly retryableCodes = [
        'ECONNABORTED',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ENETUNREACH',
    ];
    constructor() {}

    async handleBadResponse<E>(
        response: AxiosResponse,
        retryConfig: RetryConfig | undefined, 
        attempt: number, 
        maxRetries: number,
    ): Promise<HttpBadResponse<E> | null> {
        const shouldRetry = this.checkRetryBadResponse(response, attempt, maxRetries)    
        if (!shouldRetry) {
            return this.makeHttpBadResponse<E>(response)
        }

        return await this.delayOrReturnBadResponse<E>(response, retryConfig, attempt)
    }

    private checkRetryBadResponse(response: AxiosResponse, attempt: number, maxRetries: number): boolean {
        return (response.status >= 500 || response.status == 429) && attempt < maxRetries;
    }

    private async delayOrReturnBadResponse<E>(response: AxiosResponse, retryConfig: RetryConfig | undefined, attempt: number): Promise<HttpBadResponse<E> | null> {
        if (response.status >= 500) {
            await this.delayIfPossible(retryConfig, attempt)
            return null
        }
        
        if (response.status == 429) {
            const delayFromHeader = this.parseRetryAfter(response)
            if (delayFromHeader === null) {
                await this.delayIfPossible(retryConfig, attempt)
                return null
            } else {
                if (delayFromHeader > MAX_DELAY_MS) {
                    return this.makeHttpBadResponse<E>(response);
                }
                await this.sleep(delayFromHeader);
                return null
            }
        }

        return null
    }

    private makeHttpBadResponse<E>(response: AxiosResponse): HttpBadResponse<E> {
        return {
            data: null,
            error: response.data as E,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers as Record<string, string>,
            isErrorResponse: true,
            isNetworkError: false,
        };
    }

    private parseRetryAfter(response: AxiosResponse): number | null {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After

        const retryAfter = response.headers['Retry-After']
        if (!retryAfter) return null;
        
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
            return seconds * 1000;
        }
        
        const date = new Date(retryAfter);
        if (!isNaN(date.getTime())) {
            const delayMs = date.getTime() - Date.now();
            return Math.max(0, delayMs);
        }
        
        return null;
    }

    async handleNoResponse(
        error: AxiosError,
        attempt: number,
        maxRetries: number,
        retryConfig: RetryConfig | undefined,
    ): Promise<HttpNetworkErrorResponse | null> {
        const shouldRetryNetwork = this.isRetryableNetworkError(error.code) && attempt < maxRetries;
        if (shouldRetryNetwork) {
            const delay = retryConfig?.calculateRetryDelay(attempt);
            if (delay) {
                await this.sleep(delay);
                return null;
            }
        }

        return this.makeNetworkErrorResponse(error)
    }

    private makeNetworkErrorResponse(error: AxiosError): HttpNetworkErrorResponse {
        return {
            data: null,
            error: {
                message: error.message,
                code: error.code,
            },
            status: 0,
            statusText: 'Network Error',
            headers: {},
            isErrorResponse: false,
            isNetworkError: true,
        };
    }

    private isRetryableNetworkError(errorCode: string | undefined): boolean {
        if (errorCode === undefined) return false
        return this.retryableCodes.includes(errorCode);
    }

    private async delayIfPossible(retryConfig: RetryConfig | undefined, attempt: number): Promise<void> {
        if (retryConfig === undefined) return
        const delay = retryConfig.calculateRetryDelay(attempt);
        if (delay) {
            await this.sleep(delay);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

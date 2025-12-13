import { AxiosError, AxiosResponse } from "axios"
import { RetryConfig } from "src/application/common/required_port/http-client.interface"
import { HttpBadResponse, HttpNetworkErrorResponse } from "src/domain/http.response"

export interface IAxiosErrorResponseHanlder {
    handleBadResponse<E>(
        response: AxiosResponse,
        retryConfig: RetryConfig | undefined, 
        attempt: number, 
        maxRetries: number,
    ): Promise<HttpBadResponse<E> | null>

    handleNoResponse(
        error: AxiosError,
        attempt: number,
        maxRetries: number,
        retryConfig: RetryConfig | undefined,
    ): Promise<HttpNetworkErrorResponse | null>
}


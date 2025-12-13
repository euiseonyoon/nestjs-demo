
export interface NetworkError {
    message: string;
    code?: string;
}

export type HttpResponse<T = any, E = any> = 
    | HttpSuccessResponse<T>
    | HttpBadResponse<E>
    | HttpNetworkErrorResponse;

export interface HttpSuccessResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    isErrorResponse: false;
    isNetworkError: false;
}

export interface HttpBadResponse<E> {
    data: null;
    error: E;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    isErrorResponse: true;
    isNetworkError: false;
}

export interface HttpNetworkErrorResponse {
    data: null;
    error: NetworkError;
    status: 0;
    statusText: string;
    headers: Record<string, string>;
    isErrorResponse: false;
    isNetworkError: true;
}

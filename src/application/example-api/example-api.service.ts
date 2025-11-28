import { Injectable, Inject } from '@nestjs/common';
import type { HttpClient } from '../common/required_port/http-client.interface';

/**
 * 외부 API 호출 예제 서비스
 * HttpClient를 사용하여 외부 API를 호출하는 방법을 보여줍니다.
 */
@Injectable()
export class ExampleApiService {
    constructor(
        @Inject('HttpClient')
        private readonly httpClient: HttpClient,
    ) {}

    /**
     * JSONPlaceholder API에서 사용자 목록 조회
     */
    async getUsers() {
        const response = await this.httpClient.get<any[]>(
            'https://jsonplaceholder.typicode.com/users',
        );
        return response.data;
    }

    /**
     * 특정 사용자 조회
     */
    async getUserById(id: number) {
        const response = await this.httpClient.get<any>(
            `https://jsonplaceholder.typicode.com/users/${id}`,
        );
        return response.data;
    }

    /**
     * 새 포스트 생성
     */
    async createPost(title: string, body: string, userId: number) {
        const response = await this.httpClient.post<any>(
            'https://jsonplaceholder.typicode.com/posts',
            {
                title,
                body,
                userId,
            },
        );
        return response.data;
    }

    /**
     * 커스텀 헤더와 파라미터를 사용한 요청 예제
     */
    async getPostsWithParams(userId: number) {
        const response = await this.httpClient.get<any[]>(
            'https://jsonplaceholder.typicode.com/posts',
            {
                params: { userId },
                headers: {
                    'Custom-Header': 'custom-value',
                },
                timeout: 5000,
            },
        );
        return response.data;
    }

    /**
     * PUT 요청 예제
     */
    async updatePost(id: number, title: string, body: string) {
        const response = await this.httpClient.put<any>(
            `https://jsonplaceholder.typicode.com/posts/${id}`,
            {
                title,
                body,
            },
        );
        return response.data;
    }

    /**
     * DELETE 요청 예제
     */
    async deletePost(id: number) {
        const response = await this.httpClient.delete(
            `https://jsonplaceholder.typicode.com/posts/${id}`,
        );
        return response.data;
    }

    /**
     * request 메서드를 사용한 커스텀 요청 예제
     */
    async customRequest() {
        const response = await this.httpClient.request({
            url: 'https://jsonplaceholder.typicode.com/comments',
            method: 'GET',
            params: { postId: 1 },
            headers: {
                Accept: 'application/json',
            },
            timeout: 10000,
        });
        return response.data;
    }
}

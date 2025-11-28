import { Test, TestingModule } from '@nestjs/testing';
import { AxiosHttpClientAdapter } from './axios-http-client.adapter';

describe('AxiosHttpClientAdapter', () => {
    let adapter: AxiosHttpClientAdapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AxiosHttpClientAdapter],
        }).compile();

        adapter = module.get<AxiosHttpClientAdapter>(AxiosHttpClientAdapter);
    });

    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });

    describe('request', () => {
        it('should make a GET request', async () => {
            const mockUrl = 'https://jsonplaceholder.typicode.com/todos/1';
            const response = await adapter.get(mockUrl);

            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
        });

        it('should make a POST request', async () => {
            const mockUrl = 'https://jsonplaceholder.typicode.com/posts';
            const mockData = {
                title: 'test',
                body: 'test body',
                userId: 1,
            };

            const response = await adapter.post(mockUrl, mockData);

            expect(response.status).toBe(201);
            expect(response.data).toBeDefined();
        });
    });
});

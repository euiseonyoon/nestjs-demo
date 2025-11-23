import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { ResponseBigIntToStringInterceptor } from './response-big-int-to-string.interceptor';

describe('ResponseBigIntToStringInterceptor', () => {
    let interceptor: ResponseBigIntToStringInterceptor;
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: CallHandler;

    beforeEach(() => {
        interceptor = new ResponseBigIntToStringInterceptor();
        mockExecutionContext = {} as ExecutionContext;
    });

    // 헬퍼: CallHandler mock 생성
    const createMockCallHandler = (returnValue: unknown): CallHandler => ({
        handle: (): Observable<unknown> => of(returnValue),
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    describe('serialize', () => {
        it('BigInt를 string으로 변환한다', (done) => {
            // GIVEN
            const bigIntValue = 12345678901234567890n;
            mockCallHandler = createMockCallHandler({ value: bigIntValue });

            // WHEN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            value: bigIntValue.toString(10),
                        });
                        done();
                    },
                });
        });

        it('중첩된 객체 내 BigInt를 변환한다', (done) => {
            // GIVEN
            const testValue = {
                tx: {
                    blockNumber: 1000n,
                    gasUsed: 21000n,
                },
            };
            mockCallHandler = createMockCallHandler(testValue);

            // WHEN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            tx: {
                                blockNumber:
                                    testValue.tx.blockNumber.toString(10),
                                gasUsed: testValue.tx.gasUsed.toString(10),
                            },
                        });
                        done();
                    },
                });
        });

        it('배열 내 BigInt를 변환한다', (done) => {
            // GIVEN
            const testValue = { values: [1n, 2n, 3n] };
            mockCallHandler = createMockCallHandler(testValue);

            // WHEN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            values: testValue.values.map((value) =>
                                value.toString(10),
                            ),
                        });
                        done();
                    },
                });
        });

        it('배열 내 객체의 BigInt를 변환한다', (done) => {
            // GIVEN
            const testValue = {
                logs: [{ value: 100n }, { value: 200n }],
            };
            mockCallHandler = createMockCallHandler(testValue);

            // WHEN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            logs: testValue.logs.map((elem) => ({
                                value: elem.value.toString(10),
                            })),
                        });

                        done();
                    },
                });
        });

        it('null을 그대로 반환한다', (done) => {
            mockCallHandler = createMockCallHandler(null);

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        expect(result).toBeNull();
                        done();
                    },
                });
        });

        it('undefined를 그대로 반환한다', (done) => {
            mockCallHandler = createMockCallHandler(undefined);

            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        expect(result).toBeUndefined();
                        done();
                    },
                });
        });

        it('string, number, boolean은 그대로 유지한다', (done) => {
            // GIVEN
            const testValue = {
                name: 'test',
                count: 42,
                active: true,
            };
            mockCallHandler = createMockCallHandler(testValue);

            // WHEN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            name: testValue.name,
                            count: testValue.count,
                            active: testValue.active,
                        });

                        done();
                    },
                });
        });

        it('복합 구조에서 BigInt만 변환한다', (done) => {
            // GIVEN
            const testValue = {
                hash: '0x123',
                blockNumber: 12345n,
                logs: [
                    { index: 0, value: 1000n },
                    { index: 1, value: 2000n },
                ],
                meta: {
                    gasUsed: 21000n,
                    status: 'success',
                },
            };
            mockCallHandler = createMockCallHandler(testValue);

            // WEHN
            interceptor
                .intercept(mockExecutionContext, mockCallHandler)
                .subscribe({
                    next: (result) => {
                        // THEN
                        expect(result).toEqual({
                            hash: '0x123',
                            blockNumber: testValue.blockNumber.toString(10),
                            logs: testValue.logs.map((elem) => {
                                return {
                                    index: elem.index,
                                    value: elem.value.toString(10),
                                };
                            }),
                            meta: {
                                gasUsed: testValue.meta.gasUsed.toString(10),
                                status: 'success',
                            },
                        });

                        done();
                    },
                });
        });
    });
});

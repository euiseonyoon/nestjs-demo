import { Test } from "@nestjs/testing";
import { OneInchAmountGetter } from "./1inch.amount-getter";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { IOneInchInfoFetcher } from "src/application/defi.info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface";
import { ONE_INCH_INFO_FETCHER, ONE_INCH_SWAP_INFO_PROVIDER } from "src/module/module.token";
import { createTestChainInfo } from "test/factories/chain-info.factory";
import { createTestEvmAddress } from "test/factories/evm-address.factory";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";
import { ExampleMapper } from "test/examples/example.mapper";
import { OneInchHistoryResponseDto } from "src/application/defi.info-fetcher/swap/1inch/1inch-swap.info-fetcher.response";
import { createTestToken } from "test/factories/token.factory";

describe("OneInchAmountGetter (Unit test)", () => {
    const MOCK_ONE_INCH_AMOUNT_GETTER = 'MockOneInchAmountGetter';
    let oneInchAmountGetter: OneInchAmountGetter

    const sampleExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
        'test/examples/1inch/1inch.history-api.good.json'
    );
    const address = createTestEvmAddress();
    const requset = {
        chain: createTestChainInfo(),
        senderAddress: address,
        receiverAddress: address,
        txHash: createTestEvmTxHash(),
    }

    const mockInfoProvider: Partial<AbstractDefiProtocolInfoProvider> = {
        getSupportingToken: jest.fn()
    }

    const mockInfoFetcher: Partial<IOneInchInfoFetcher> = {
        fetchSwapOutAmount: jest.fn()
    }

    beforeEach(async() => {
        const testingBuilder = Test.createTestingModule({
            providers: [
                { provide: ONE_INCH_SWAP_INFO_PROVIDER, useValue: mockInfoProvider },
                { provide: ONE_INCH_INFO_FETCHER, useValue: mockInfoFetcher },
                { provide: MOCK_ONE_INCH_AMOUNT_GETTER, useClass: OneInchAmountGetter },
            ],
        })
        const module = await testingBuilder.compile();
        oneInchAmountGetter = module.get<OneInchAmountGetter>(MOCK_ONE_INCH_AMOUNT_GETTER);
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });

    it('인스턴스 주입 및 정의 테스트', () => {
        expect(oneInchAmountGetter).toBeDefined();
    });
    
    describe("getSwapOutAmount() 실패", () => {
        it("1inch history api로 부터 결과 가져오기 실패", async () => {
            // GIVEN
            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(null);

            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });

        it("supporting 하지 않는 토큰일 경우 실패", async () => {
            // GIVEN
            const oneInchInfoProvider = oneInchAmountGetter['oneInchInfoProvider'];
            jest.spyOn(oneInchInfoProvider, 'getSupportingToken').mockResolvedValue(null);

            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });

        it("history api response결과를 파싱하던중 원하던 txHash를 찾을수 없는 경우 실패", async () => {
            // GIVEN
            const fakeTxHash = "0x0b3adf4bf1ba24be2d4446de7888a1b991966f8c1a0e203d3807dac3f8f58f65";
            const realResponseExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
                'test/examples/1inch/1inch.history-api.good.json'
            );
            realResponseExample.items[0].details.txHash = fakeTxHash

            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(realResponseExample);
            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });

        it("history api response결과를 파싱하던중 원하던 상태('completed')를 찾을수 없는 경우 실패", async () => {
            // GIVEN
            const realResponseExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
                'test/examples/1inch/1inch.history-api.good.json'
            );
            realResponseExample.items[0].details.txHash = requset.txHash.hash
            realResponseExample.items[0].details.status = `not${OneInchAmountGetter.TARGET_STATUS}`

            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(realResponseExample);
            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });

        it("history api response결과를 파싱하던중 원하던 상태('completed')를 찾을수 없는 경우 실패", async () => {
            // GIVEN
            const realResponseExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
                'test/examples/1inch/1inch.history-api.good.json'
            );
            realResponseExample.items[0].details.txHash = requset.txHash.hash
            realResponseExample.items[0].details.type = "aaaa"

            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(realResponseExample);
            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });

        it("history api response결과에서 swap out 수령자가 request의 수령자와 다른 경우 실패", async () => {
            // GIVEN
            const realResponseExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
                'test/examples/1inch/1inch.history-api.good.json'
            );
            realResponseExample.items[0].details.txHash = requset.txHash.hash

            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(realResponseExample);
            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });
    });

    describe("getSwapOutAmount() 성공", () => {
        it("실제 response를 사용한 테스트", async () => {
            // GIVEN
            const realResponseExample = ExampleMapper.fromFile<OneInchHistoryResponseDto>(
                'test/examples/1inch/1inch.history-api.good.json'
            );
            const oneInchInfoFetcher = oneInchAmountGetter['oneInchInfoFetcher'];
            jest.spyOn(oneInchInfoFetcher, 'fetchSwapOutAmount').mockResolvedValue(realResponseExample);

            const oneInchInfoProvider = oneInchAmountGetter['oneInchInfoProvider'];
            const chainInfo = createTestChainInfo()
            const randomToken = createTestToken({chain: chainInfo})
            jest.spyOn(oneInchInfoProvider, 'getSupportingToken').mockResolvedValue(randomToken);

            const accountAddress = createTestEvmAddress(realResponseExample.items[0].details.fromAddress);
            const txHash = createTestEvmTxHash(realResponseExample.items[0].details.txHash)
            const requset = {
                chain: createTestChainInfo({id: chainInfo.id}),
                senderAddress: accountAddress,
                receiverAddress: accountAddress,
                txHash: txHash,
            }
            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)

            // THEN
            expect(result).not.toBeNull()

            expect(result?.token).not.toBeNull()
            expect(result?.token.chain.id).toEqual(randomToken.chain.id)
            expect(result?.token.address.getAddress().toLowerCase()).toEqual(randomToken.address.getAddress().toLowerCase())

            expect(result?.amount).not.toBeNull()
            expect(result?.amount).toEqual(BigInt(realResponseExample.items[0].details.tokenActions[1].amount))
        });
    });
});

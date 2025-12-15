import { Test } from "@nestjs/testing";
import { OneInchAmountGetter } from "./1inch.amount-getter";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { IOneInchInfoFetcher } from "src/application/defi.info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface";
import { ONE_INCH_INFO_FETCHER, ONE_INCH_SWAP_INFO_PROVIDER } from "src/module/module.token";
import { createTestChainInfo } from "test/factories/chain-info.factory";
import { createTestEvmAddress } from "test/factories/evm-address.factory";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";

describe("OneInchAmountGetter (Unit test)", () => {
    const MOCK_ONE_INCH_AMOUNT_GETTER = 'MockOneInchAmountGetter';
    let oneInchAmountGetter: OneInchAmountGetter

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

        it("supporting 하지 않는 토큰일 경우  실패", async () => {
            // GIVEN
            const oneInchInfoProvider = oneInchAmountGetter['oneInchInfoProvider'];
            jest.spyOn(oneInchInfoProvider, 'getSupportingToken').mockResolvedValue(null);

            // WHEN
            const result = await oneInchAmountGetter.getSwapOutAmount(requset)
            // THEN
            expect(result).toBeNull()
        });
    });
});

import { Test } from "@nestjs/testing";
import { OneInchService } from "./1inch-swap.service";
import { ISwapQuoter } from "src/application/quoter/swap/provided_port/swap.quoter";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { ISwapAmountGetter } from "src/application/amount-getter/swap/provided_port/swap.amount-getter";
import { ONE_INCH_SWAP_AMOUNT_GETTER, ONE_INCH_SWAP_INFO_PROVIDER, ONE_INCH_SWAP_QUOTER } from "src/module/module.token";
import { NaiveCrossChainSwapQuoteRequest, NaiveSameChainSwapQuoteRequest, NaiveSwapOutAmountRequest } from "../request.type";
import { createTestEvmAddress } from "test/factories/evm-address.factory";
import { createTestToken } from "test/factories/token.factory";
import { SupportedTokens } from "src/domain/supported.token";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";
import { createTestChainInfo } from "test/factories/chain-info.factory";

describe("OneInchService (Unit Test)", () => {
    let oneInchService: OneInchService;

    const quoter: ISwapQuoter = {
        getQuote: jest.fn().mockResolvedValue(null)
    }
    const infoProvider: Partial<AbstractDefiProtocolInfoProvider> = {
        getSupprtedTokens: jest.fn().mockResolvedValue(null),
        getSupportingChainInfo: jest.fn().mockResolvedValue(null),
    };
    const amountGetter: ISwapAmountGetter = {
        getSwapOutAmount: jest.fn().mockResolvedValue(null)
    };

    const simpleQuoteReq = new NaiveSameChainSwapQuoteRequest(
        1,
        createTestEvmAddress(),
        createTestEvmAddress(),
        "10",
        "0.3",
        null
    )

    const crossChainQuoteReq = new NaiveCrossChainSwapQuoteRequest(
        1,
        8453,
        createTestEvmAddress(),
        createTestEvmAddress(),
        "10",
        "0.3",
    )

    const naiveSwapAmountReq = {
        chainId: 1,
        senderAddress: createTestEvmAddress(),
        receiverAddress: createTestEvmAddress(),
        txHash: createTestEvmTxHash(),
    } as NaiveSwapOutAmountRequest

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                { provide: ONE_INCH_SWAP_QUOTER, useValue: quoter},
                { provide: ONE_INCH_SWAP_INFO_PROVIDER, useValue: infoProvider},
                { provide: ONE_INCH_SWAP_AMOUNT_GETTER, useValue: amountGetter},
                OneInchService,
            ],
        }).compile();

        oneInchService = moduleRef.get<OneInchService>(OneInchService);
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });

    it('인스턴스가 정의되어야 함', () => {
        expect(oneInchService).toBeDefined();
    });

    describe("getQuote() 실패", () => {
        it("지원하지 않는 1inch cross chain swap", async () => {
            // WHEN
            const result = await oneInchService.getQuote(crossChainQuoteReq)
            // THEN
            expect(result).toBeNull()
        });

        it("infoProvider.getSupprtedTokens()가 null -> convertToSimpleSwapQuoteRequest() 실패", async () => {
            // WHEN
            const result = await oneInchService.getQuote(simpleQuoteReq)
            // THEN
            expect(result).toBeNull()
        });

        it("quoter.getQuote() 실패", async () => {
            // GIVEN
            const supportedTokens = {
                srcToken: createTestToken(),
                dstToken: createTestToken(),
            } as SupportedTokens
            const infoProvider = oneInchService['oneInchInfoProvider'];
            jest.spyOn(infoProvider, 'getSupprtedTokens').mockResolvedValue(supportedTokens);

            // WHEN
            const result = await oneInchService.getQuote(simpleQuoteReq)
            // THEN
            expect(result).toBeNull()
        });
    });

    describe("getSwapOutAmount() 실패", () => {
        it("infoProvider.getSupportingChainInfo()가 null -> convertAmountOutRequest() 실패", async () => {
            // WHEN
            const result = await oneInchService.getSwapOutAmount(naiveSwapAmountReq)
            // THEN
            expect(result).toBeNull()
        });


        it("oneInchAmountGetter.getSwapOutAmount() 실패", async () => {
            // GIVEN
            const mockChainInfo = createTestChainInfo()
            const infoProvider = oneInchService['oneInchInfoProvider'];
            jest.spyOn(infoProvider, 'getSupportingChainInfo').mockResolvedValue(mockChainInfo);

            // WHEN
            const result = await oneInchService.getSwapOutAmount(naiveSwapAmountReq)
            // THEN
            expect(result).toBeNull()
        });
    });
});

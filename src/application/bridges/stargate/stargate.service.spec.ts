import { Test } from "@nestjs/testing";
import { StargateService } from "./stargate.service";
import { AbstractStargateInfoProvider } from "./required_port/stargate.info-provider";
import { IBridgeQuoter } from "src/application/quoter/bridge/provided_port/bridge.quoter";
import { IBridgeAmountGetter } from "src/application/amount-getter/bridge/provided_port/bridge.amount-getter";
import { NaiveBridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";
import { createTestEvmAddress } from "test/factories/evm-address.factory";
import { E_ADDRESS } from "src/domain/token.class";
import { STARGATE_BRIDGE_AMOUNT_GETTER, STARGATE_BRIDGE_INFO_PROVIDER, STARGATE_QUOTER } from "src/module/module.token";
import { SupportedTokens } from "src/domain/supported.token";
import { createTestToken } from "test/factories/token.factory";

describe("StargateService (Unit Test)", () => {
    let startgateService: StargateService;
    let mockStargateInfoProvider: Partial<AbstractStargateInfoProvider>
    let mockStargateQuoter: IBridgeQuoter
    let mockStargateAmountGetter: IBridgeAmountGetter

    const naiveHistoryReq = {
        srcChainId: 1,
        dstChainId: 8453,
        srcTokenAddress: createTestEvmAddress(E_ADDRESS),
        dstTokenAddress: createTestEvmAddress(E_ADDRESS),
        srcTxHash: createTestEvmTxHash(),
    } as NaiveBridgeHistoryRequest

    const accountAddress = createTestEvmAddress()
    const naiveQuoteReq = {
        srcChainId: 1,
        dstChainId: 8453,
        srcTokenAddress: createTestEvmAddress(E_ADDRESS),
        dstTokenAddress: createTestEvmAddress(E_ADDRESS),
        bridgeInAmount: 1,
        receiverAddress: accountAddress,
        senderAddresss: accountAddress,
    } as NavieBridgeQuoteRequest

    const supportedTokens =  { 
        srcToken: createTestToken(), 
        dstToken: createTestToken(),
    } as SupportedTokens

    
    beforeEach(async () => {
        mockStargateInfoProvider = {
            getSupprtedTokens: jest.fn().mockResolvedValue(null)
        }
        mockStargateQuoter = {
            getQuote: jest.fn().mockResolvedValue(null)
        }
        mockStargateAmountGetter = {
            getBridgeOutAmount: jest.fn().mockResolvedValue(null)
        }

        const moduleRef = await Test.createTestingModule({
            providers: [
                { provide: STARGATE_BRIDGE_INFO_PROVIDER, useValue: mockStargateInfoProvider},
                { provide: STARGATE_QUOTER, useValue: mockStargateQuoter},
                { provide: STARGATE_BRIDGE_AMOUNT_GETTER, useValue: mockStargateAmountGetter},
                StargateService,
            ],
        }).compile();

        startgateService = moduleRef.get<StargateService>(StargateService);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    });

    it('인스턴스가 정의되어야 함', () => {
        expect(startgateService).toBeDefined();
    });

    describe("getBridgeOutAmount() 실패", () => {
        it("infoProvider.convertAmountRequest() 실패", async () => {
            // WHEN
            const result = await startgateService.getBridgeOutAmount(naiveHistoryReq)
    
            // THEN
            expect(result).toBeNull()
        });

        it("amountGetter.getBridgeOutAmount() 실패", async () => {
            // GIVEN
            const infoProvider = startgateService['stargateInfoProvider'];
            jest.spyOn(infoProvider, 'getSupprtedTokens').mockResolvedValue(supportedTokens);

            const amountGetter = startgateService['stargateAmountGetter'];
            jest.spyOn(amountGetter, 'getBridgeOutAmount').mockResolvedValue(null);
    
            // WHEN
            const result = await startgateService.getBridgeOutAmount(naiveHistoryReq)
    
            // THEN
            expect(result).toBeNull()
        });
    });

    describe("getQuote() 실패", () => {
        it("infoProvider.getSupportedTokens() 실패", async () => {
            // WHEN
            const result = await startgateService.getQuote(naiveQuoteReq)

            // THEN
            expect(result).toBeNull()
        });

        it("quoter.getQuote() 실패", async () => {
            // GIVEN
            const infoProvider = startgateService['stargateInfoProvider'];
            jest.spyOn(infoProvider, 'getSupprtedTokens').mockResolvedValue(supportedTokens);
            
            const quoter = startgateService['stargateQuoter'];
            jest.spyOn(quoter, 'getQuote').mockResolvedValue(null);            
    
            // WHEN
            const result = await startgateService.getQuote(naiveQuoteReq)

            // THEN
            expect(result).toBeNull()
        });
    });
});
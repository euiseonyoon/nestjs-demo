import { Test, TestingModule } from "@nestjs/testing";
import { StargateAmountGetter } from "./stargate.amount-getter";
import { BridgeAmountRequest } from "../response.bridge-amount";
import { ILayerZeroService } from "src/application/bridges/stargate/required_port/layer-zero.interface";
import { createTestToken } from "test/factories/token.factory";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";
import { LAYER_ZERO_SERVICE } from "src/module/module.token";
import { LayerZeroScanBridgeData, LayerZeroStatus } from "src/application/layer-zero/response.type";
import { TransactionReceipt } from "viem";
import { mockedTransactionReceipt } from "test/factories/transaction.factory";

describe('StargateAmountGetter (Unit test)', () => {
    let stargateAmountGetter: StargateAmountGetter

    const mockILayerZeroService: ILayerZeroService = { 
        fetchBridgeInfo: jest.fn(),
        getTxReceiptUsingDstInfo: jest.fn(), 
        getBridgeOutAmountFromReceipt: jest.fn(),
    }

    const bridgeAmountReq: BridgeAmountRequest = {
        srcToken: createTestToken(),
        dstToken: createTestToken(),
        srcTxHash: createTestEvmTxHash(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({

            providers: [
                { provide: LAYER_ZERO_SERVICE, useValue: mockILayerZeroService},
                StargateAmountGetter
            ],
        }).compile();

        stargateAmountGetter = module.get<StargateAmountGetter>(StargateAmountGetter);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
    });

    it('인스턴스 주입 및 정의 테스트', () => {
        expect(stargateAmountGetter).toBeDefined();
    });

    it('layer zero로부터 bridge data 가져오기 실패', async () => {
        // GIVEN
        const layerZeroService = stargateAmountGetter['layerZeroService'];
        jest.spyOn(layerZeroService, 'fetchBridgeInfo').mockResolvedValue(null);

        // WHEN
        const result = await stargateAmountGetter.getBridgeOutAmount(bridgeAmountReq)
        expect(result).toBeNull()
    });

    it('layer zero bridge data의 status가 DELIVERD가 아님', async () => {
        // GIVEN
        const pending = "PENDING"
        const wrongStatus: Partial<LayerZeroStatus> = {
            name: pending
        }
        const mockedLayerZeroScanBridgeData: Partial<LayerZeroScanBridgeData> = {
            status: wrongStatus as LayerZeroStatus
        }
        const layerZeroService = stargateAmountGetter['layerZeroService'];
        jest.spyOn(layerZeroService, 'fetchBridgeInfo').mockResolvedValue(mockedLayerZeroScanBridgeData as LayerZeroScanBridgeData);

        // WHEN
        const result = await stargateAmountGetter.getBridgeOutAmount(bridgeAmountReq)
        
        // THEN
        expect(result).not.toBeNull()
        expect(result?.bridgeOutAmount).toBeNull()
        expect(result?.status).toEqual(pending)
    });

    it('layer zero dstTxHash의 receipt를 구하는데 실패함', async () => {
        // GIVEN
        const layerZeroService = stargateAmountGetter['layerZeroService'];
        const deliveredBridgeData: Partial<LayerZeroScanBridgeData> = {
            status: { name: StargateAmountGetter.STATUS_DELIVERED, message: "" } as LayerZeroStatus,
            pathway: { dstEid: 30102 } as any,
            destination: { tx: { txHash: bridgeAmountReq.srcTxHash.hash } } as any
        };
        jest.spyOn(layerZeroService, 'fetchBridgeInfo').mockResolvedValue(deliveredBridgeData as LayerZeroScanBridgeData);
        jest.spyOn(layerZeroService, 'getTxReceiptUsingDstInfo').mockResolvedValue(null);

        // WHEN
        const result = await stargateAmountGetter.getBridgeOutAmount(bridgeAmountReq)

        // THEN
        expect(result).toBeNull()
    });

    it('layer zero dstTxHash의 receipt의 logs로 부터 bridge out 결과를 가져오는데 실패함.', async () => {
        // GIVEN
        const layerZeroService = stargateAmountGetter['layerZeroService'];
        const deliveredBridgeData: Partial<LayerZeroScanBridgeData> = {
            status: { name: StargateAmountGetter.STATUS_DELIVERED, message: "" } as LayerZeroStatus,
            pathway: { dstEid: 30102 } as any,
            destination: { tx: { txHash: bridgeAmountReq.srcTxHash.hash } } as any
        };
        jest.spyOn(layerZeroService, 'fetchBridgeInfo').mockResolvedValue(deliveredBridgeData as LayerZeroScanBridgeData);
        jest.spyOn(layerZeroService, 'getTxReceiptUsingDstInfo').mockResolvedValue(mockedTransactionReceipt as TransactionReceipt);
        jest.spyOn(layerZeroService, 'getBridgeOutAmountFromReceipt').mockResolvedValue(null);

        // WHEN
        const result = await stargateAmountGetter.getBridgeOutAmount(bridgeAmountReq)
        
        // THEN
        expect(result).toBeNull()
    });
});

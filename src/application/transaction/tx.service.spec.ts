import { Test, TestingModule } from "@nestjs/testing";
import { TxService } from "./tx.service";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { BadRequestException } from "@nestjs/common";
import { TransactionReceiptNotFoundError } from "viem";
import { IRpcClientManager } from "./required_port/tx.required-port";
import { RPC_CLIENT_MANAGER } from "src/infrastructure/infrastructure.token";

describe('TxService (Unit test)', ()=>{
    let txService: TxService;
    const dummyEvmTxHash = new EvmTxHash('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    
    const mockIRpcClientManager: IRpcClientManager = {
        getRpcClient: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ 
                { provide: RPC_CLIENT_MANAGER, useValue: mockIRpcClientManager },
                TxService,
            ],
        }).compile();

        txService = module.get<TxService>(TxService);
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });

    it('서비스 인스턴스 주입 및 정의 테스트', () => {
        expect(txService).toBeDefined();
    });

    it('지원하지 않는 체인 테스트', () => {
        // GIVEN 
        const badChainId = 0;

        expect(
            txService.getTxReceipt(dummyEvmTxHash, badChainId)
        ).rejects.toThrow(BadRequestException);
    });

    it('특정 체인의 Public Client를 찾지 못할떄', () => {
        // GIVEN: 유효한 체인이지만 getRpcClient가 null을 반환하도록 mock
        const ethereumChainId = 1;
        const rpcClientManager = txService['rpcClientManager'];
        jest.spyOn(rpcClientManager, 'getRpcClient').mockReturnValue(null);

        // WHEN & THEN
        expect(
            txService.getTxReceipt(dummyEvmTxHash, ethereumChainId)
        ).resolves.toBeNull();
    });

    it('트랜잭션이 pending이거나 존재하지 않을 때 (TransactionReceiptNotFoundError)', () => {
        // GIVEN: getTransactionReceipt가 TransactionReceiptNotFoundError를 throw하도록 mock
        const ethereumChainId = 1;
        const rpcClientManager = txService['rpcClientManager'];

        const mockClient = {
            getTransactionReceipt: jest.fn().mockRejectedValue(
                new TransactionReceiptNotFoundError({ hash: dummyEvmTxHash.toViemHash() })
            )
        };

        jest.spyOn(rpcClientManager, 'getRpcClient').mockReturnValue(mockClient as any);

        // WHEN & THEN
        expect(
            txService.getTxReceipt(dummyEvmTxHash, ethereumChainId)
        ).resolves.toBeNull();
    });
})
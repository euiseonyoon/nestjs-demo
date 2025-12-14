import { Test, TestingModule } from "@nestjs/testing";
import { SushiSwapAmoutGetter } from "./sushi-swap.amount-getter";
import { SUSHI_SWAP_INFO_PROVIDER, TX_SERVICE } from "src/module/module.token";
import { ITxService } from "src/application/transaction/provided_port/tx.provided-port";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { createTestChainInfo } from "test/factories/chain-info.factory";
import { mockedLogs, mockedTransactionReceipt } from "test/factories/transaction.factory";
import { createTestToken } from "test/factories/token.factory";
import { createTestEvmAddress } from "test/factories/evm-address.factory";
import { createTestEvmTxHash } from "test/factories/evm-tx-hash.factory";
import { ERC20_TOPICS } from "src/application/common/erc20/erc20.topics";
import { Hex, Log, pad, TransactionReceipt } from "viem";

describe('SushiswapAmountGetter (Unit test)', () => {
    let sushiSwapAmountGetter: SushiSwapAmoutGetter

    const randomToken = createTestToken()
    const accountAddr = createTestEvmAddress()
    
    const mockITxService: ITxService = {
        getTxReceipt: jest.fn().mockResolvedValue(mockedTransactionReceipt)
    }
    const mockInfoProvider: Partial<AbstractDefiProtocolInfoProvider> = {
        getSupportingToken: jest.fn().mockResolvedValue(randomToken)
    }

    const swapOutAmountRequest = {
        chain: createTestChainInfo(),
        senderAddress: accountAddr,
        receiverAddress: accountAddr,
        txHash: createTestEvmTxHash(),
    }

    function createReceiptWithoutLogs(): TransactionReceipt {
        return {
            ...mockedTransactionReceipt, 
            logs: [], // logs 속성을 덮어씌움
        };
    }

    function createReceiptWithTargetLog(): TransactionReceipt {
        const account = pad(swapOutAmountRequest.senderAddress.getAddress().toLowerCase() as Hex, { size: 32 }).toLowerCase();
        const goodLog = {
            ...mockedLogs[0],
            topics: [
                ERC20_TOPICS.TRANSFER.toString().toLowerCase(),
                account,
                account,
            ] as [Hex, ...Hex[]],
        } as Log

        return {
            ...mockedTransactionReceipt, 
            logs: [
                goodLog
            ] as TransactionReceipt['logs'],
        };
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ 
                { provide: TX_SERVICE, useValue: mockITxService },
                { provide: SUSHI_SWAP_INFO_PROVIDER, useValue: mockInfoProvider },
                SushiSwapAmoutGetter,
            ],
        }).compile();

        sushiSwapAmountGetter = module.get<SushiSwapAmoutGetter>(SushiSwapAmoutGetter);
    });

    afterEach(() => {
        jest.restoreAllMocks(); 
    });

    it('서비스 인스턴스 주입 및 정의 테스트', () => {
        expect(sushiSwapAmountGetter).toBeDefined();
    });

    describe('getSwapOutAmount() 실패 case', () => {
        it('tx receipt 가져오기 실패', async () => {
            // GIVEN
            const txService = sushiSwapAmountGetter['txService'];
            jest.spyOn(txService, 'getTxReceipt').mockResolvedValue(null);

            // WHEN
            const result = await sushiSwapAmountGetter.getSwapOutAmount(swapOutAmountRequest);

            // THEN
            expect(result).toBeNull();
        });

        it('tx receipt에서 찾고자 하는 log를 찾지 못해 실패', async () => {
            // GIVEN
            const receiptWithoutLogs = createReceiptWithoutLogs();
            receiptWithoutLogs.logs.forEach((log) => {
                expect(
                    log.topics[0]?.toLocaleLowerCase()
                ).not.toEqual(ERC20_TOPICS.TRANSFER.toString().toLowerCase())
            });
            const txService = sushiSwapAmountGetter['txService'];
            jest.spyOn(txService, 'getTxReceipt').mockResolvedValue(null);

            // WHEN
            const result = await sushiSwapAmountGetter.getSwapOutAmount(swapOutAmountRequest);

            // THEN
            expect(result).toBeNull();
        });

        it('sushi swap에서 지원하지 않는 토큰일 경우 실패', async () => {
            // GIVEN
            const receiptWithTargetLog = createReceiptWithTargetLog();
            const txService = sushiSwapAmountGetter['txService'];
            jest.spyOn(txService, 'getTxReceipt').mockResolvedValue(receiptWithTargetLog);
            const sushiSwapInfoProvider = sushiSwapAmountGetter['sushiSwapInfoProvider'];
            jest.spyOn(sushiSwapInfoProvider, 'getSupportingToken').mockResolvedValue(null);

            // WHEN
            const result = await sushiSwapAmountGetter.getSwapOutAmount(swapOutAmountRequest);
            
            // THEN
            expect(result).toBeNull();
        });

        it('sushi swap에서 지원하지 않는 토큰일 경우 실패', async () => {
            // GIVEN
            const receiptWithTargetLog = createReceiptWithTargetLog();
            const txService = sushiSwapAmountGetter['txService'];
            jest.spyOn(txService, 'getTxReceipt').mockResolvedValue(receiptWithTargetLog);

            const result = await sushiSwapAmountGetter.getSwapOutAmount(swapOutAmountRequest);
            expect(result).toBeNull();
        });
    })

    describe('getSwapOutAmount() 성공 case', () => {
        it('tx receipt 가져오기 실패', async () => {
            // GIVEN
            const receiptWithTargetLog = createReceiptWithTargetLog();
            const txService = sushiSwapAmountGetter['txService'];
            jest.spyOn(txService, 'getTxReceipt').mockResolvedValue(receiptWithTargetLog);

            // THEN
            const result = await sushiSwapAmountGetter.getSwapOutAmount(swapOutAmountRequest);
            
            expect(result).not.toBeNull();
            expect(result?.amount).toEqual(BigInt(receiptWithTargetLog.logs[0].data));
            expect(result?.token.chain.id).toEqual(randomToken.chain.id)
            expect(result?.token.address.getAddress().toLowerCase()).toEqual(randomToken.address.getAddress().toLowerCase())
        });
    })
});
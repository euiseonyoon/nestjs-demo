import { Test, TestingModule } from '@nestjs/testing';
import { SushiSwapService } from './sushi-swap.service';
import { NaiveCrossChainSwapQuoteRequest } from '../request.type';
import { EvmAddress } from 'src/domain/evm-address.class';
import { E_ADDRESS } from 'src/domain/token.class';
import { SUSHI_SWAP_AMOUNT_GETTER, SUSHI_SWAP_INFO_PROVIDER, SUSHI_SWAP_QUOTER } from 'src/module/module.token';
import { ISwapQuoter } from 'src/application/quoter/swap/provided_port/swap.quoter';
import { AbstractDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';
import { ISwapAmountGetter } from 'src/application/amount-getter/swap/provided_port/swap.amount-getter';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';

describe('SushiSwapService (Unit Test)', () => {
    let service: SushiSwapService;

    // Test data - real token addresses on Ethereum
    const ethereumChainId = 1;
    const bscChainId = 56;
    const ethOnEthereumAddr = new EvmAddress(E_ADDRESS);
    const usdtOnBscAddr = new EvmAddress('0x55d398326f99059fF775485246999027B3197955');
    const mockAmount = '0.1';
    const mockSlippage = '0.5';

    const mockSushiSwapQuoter: ISwapQuoter = {
        getQuote: jest.fn(), // 쿼터는 호출되지 않을 것이므로 Mocking
    };
    
    // AbstractSwapService의 생성자가 요구하므로 Partial 타입을 사용하거나 모든 추상 메서드를 정의해야 함
    const mockSushiSwapInfoProvider: Partial<AbstractDefiProtocolInfoProvider> = {
        getSupprtedTokens: jest.fn(),
        getSupportingChainInfo: jest.fn().mockResolvedValue(null), // <-- getSwapOutAmount()시 호출됨
    };

    const mockSushiSwapAmountGetter: ISwapAmountGetter = {
        getSwapOutAmount: jest.fn()
    };
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: SUSHI_SWAP_QUOTER, useValue: mockSushiSwapQuoter },
                { provide: SUSHI_SWAP_INFO_PROVIDER, useValue: mockSushiSwapInfoProvider },
                { provide: SUSHI_SWAP_AMOUNT_GETTER, useValue: mockSushiSwapAmountGetter },
                SushiSwapService,
            ],
        }).compile();

        service = module.get<SushiSwapService>(SushiSwapService);
    });

    it('인스턴스 주입 및 정의 테스트', () => {
        expect(service).toBeDefined();
    });

    describe('getQuote()', () => {
       it('Cross-Chain Swap 미지원 테스트', () => {
            // GIVEN 
            const crossChainSwapRequest = new NaiveCrossChainSwapQuoteRequest(
                ethereumChainId,
                bscChainId,
                ethOnEthereumAddr,
                usdtOnBscAddr,
                mockAmount,
                mockSlippage,
            )

            expect(service.getQuote(crossChainSwapRequest)).resolves.toBeNull()
        });
    });

     describe('getSwapOutAmount()', () => {
       it('convertedRequest를 구하기 실패 테스트', () => {
            const dummyAddr = new EvmAddress(E_ADDRESS)
            // GIVEN 
            const request = {
                chainId: 1,
                senderAddress: dummyAddr,
                receiverAddress: dummyAddr,
                txHash: new EvmTxHash('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
            }

            expect(service.getSwapOutAmount(request)).resolves.toBeNull()
        });
    });
});

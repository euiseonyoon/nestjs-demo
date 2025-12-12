import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SushiSwapService } from './sushi-swap.service';
import { SwapQuoterModule } from 'src/module/swap.quoter.module';
import { InfoProviderModule } from 'src/module/info-provider.module';
import { SwapAmountGetterModule } from 'src/module/swap.amount-getter.module';
import { NaiveSameChainSwapQuoteRequest, NaiveCrossChainSwapQuoteRequest } from '../request.type';
import { EvmAddress } from 'src/domain/evm-address.class';
import { Token, E_ADDRESS } from 'src/domain/token.class';
import { PublicClientModule } from 'src/module/public-client.module';
import 'src/infrastructure/rpc-node-provider/ethereum.public-clients';
import 'src/infrastructure/rpc-node-provider/base.public-clients';

describe('SushiSwapService (Integration Test)', () => {
    let service: SushiSwapService;

    // Test data - real token addresses on Ethereum
    const mockChainId = 1;
    const ethOnEthereumAddr = new EvmAddress(E_ADDRESS);
    const usdcOnEthereumAddr = new EvmAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    const usdtOnEthereumAddr = new EvmAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    const mockAmount = '0.1';
    const mockSlippage = '0.5';
    const mockMaxPriceImpact = null;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env',
                }),
                SwapQuoterModule,
                InfoProviderModule,
                SwapAmountGetterModule,
                PublicClientModule,
            ], 
            providers: [
                SushiSwapService,

            ],
        }).compile();

        service = module.get<SushiSwapService>(SushiSwapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getQuote', () => {
        it('should successfully get quote for ETH -> USDT swap with real API call', async () => {
            // GIVEN: Real swap request
            const request = new NaiveSameChainSwapQuoteRequest(
                mockChainId,
                ethOnEthereumAddr,
                usdtOnEthereumAddr,
                mockAmount,
                mockSlippage,
                mockMaxPriceImpact
            );

            // WHEN: Call real service with actual API
            const result = await service.getQuote(request);

            // THEN: Validate real API response structure
            expect(result).not.toBeNull();
            if (result) {
                expect(result).toHaveProperty('amount');
                expect(result).toHaveProperty('token');
                expect(result.token).toBeInstanceOf(Token);
                expect(result.token.symbol).toBe('USDT');
                expect(BigInt(result.amount)).toBeGreaterThan(0n);

                // Log for debugging
                console.log(`✅ Quote result: ${result.amount.toString()} ${result.token.symbol}`);
            }
        });

        it('should successfully get quote for USDC -> USDT swap with real API call', async () => {
            // GIVEN: Real swap request
            const request = new NaiveSameChainSwapQuoteRequest(
                mockChainId,
                usdcOnEthereumAddr,
                usdtOnEthereumAddr,
                mockAmount,
                mockSlippage,
                mockMaxPriceImpact
            );

            // WHEN: Call real service with actual API
            const result = await service.getQuote(request);

            // THEN: Validate real API response structure
            expect(result).not.toBeNull();
            if (result) {
                expect(result).toHaveProperty('amount');
                expect(result).toHaveProperty('token');
                expect(result.token).toBeInstanceOf(Token);
                expect(result.token.symbol).toBe('USDT');
                expect(BigInt(result.amount)).toBeGreaterThan(0n);

                // Log for debugging
                console.log(`✅ Quote result: ${result.amount.toString()} ${result.token.symbol}`);
            }
        });
    })
});

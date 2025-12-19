import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EvmAddress } from 'src/domain/evm-address.class';
import { Token, E_ADDRESS } from 'src/domain/token.class';
import { PublicClientModule } from 'src/module/public-client.module';
import 'src/infrastructure/rpc-node-provider/ethereum.public-clients';
import 'src/infrastructure/rpc-node-provider/base.public-clients';
import { SwapQuoterModule } from 'src/module/swap.quoter.module';
import { InfoProviderModule } from 'src/module/info-provider/info-provider.module';
import { SwapAmountGetterModule } from 'src/module/swap.amount-getter.module';
import { SushiSwapService } from 'src/application/swaps/sushi-swap/sushi-swap.service';
import { NaiveSameChainSwapQuoteRequest, NaiveSwapOutAmountRequest } from 'src/application/swaps/request.type';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { mainnet } from 'viem/chains';

describe('SushiSwapService (Integration Test)', () => {
    let service: SushiSwapService;

    // Test data - real token addresses on Ethereum
    const mockChainId = 1;
    const ethOnEthereumAddr = new EvmAddress(E_ADDRESS);
    const usdtOnEthereumAddr = new EvmAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7');
    const mockAmount = '0.1';
    const mockSlippage = '0.5';
    const mockMaxPriceImpact = null;

    beforeAll(async () => {
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

    it('인스턴스 주입 및 정의 테스트', () => {
        expect(service).toBeDefined();
    });

    describe('getQuote', () => {
        it('Ether@Ethereum -> USDT@Ethereum getQuote() 성공 테스트', async () => {
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
    })


    describe('getSwapOutAmount', () => {
        it('swap out amount 확인', async () => {
            /** 
             * https://etherscan.io/tx/0x8db5d7ba60e97c9690e5e02e4e9afd6743d168121b1243318cce0fee06869bb9
             * From, To: 0x7bC38f9e6A9dD19AA147D400a01308868CEb8890
             * USDC@Ethereum -> USDT@Etherem 으로 SushiSwap 사용
            */

            // GIVEN
            const accountAddr = new EvmAddress('0x7bC38f9e6A9dD19AA147D400a01308868CEb8890')
            const txHash = new EvmTxHash('0x8db5d7ba60e97c9690e5e02e4e9afd6743d168121b1243318cce0fee06869bb9')
            const naiveRequest = {
                chainId: mainnet.id,
                senderAddress: accountAddr,
                receiverAddress: accountAddr,
                txHash: txHash,
            } as NaiveSwapOutAmountRequest

            // WHEN
            const result = await service.getSwapOutAmount(naiveRequest)

            // THEN
            expect(result).not.toBeNull()
            expect(result?.amount).toBeGreaterThan(0n)
            expect(result?.token.symbol).toEqual('USDT')
        });
    })
});

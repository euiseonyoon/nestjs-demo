import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IHttpClient, HttpResponse } from '../../common/required_port/http-client.interface';
import { SwapService } from '../swap.service';
import { ChainId } from 'src/domain/chain-id.enum';
import { Token } from 'src/domain/token.class';
import { Cron } from '@nestjs/schedule';
import { ClassicSwapQuoteResponse, OneInchHistoryResponseDto, OneInchTokenData, OneInchTokensResponse, TokenActionDto } from './1inch-response.type';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { EvmAddress } from 'src/domain/evm-address.class';
import { SameChainSwapQuoteRequest, SwapOutAmountRequest, SwapQuoteRequest } from '../request.type';
import { ISwapService } from '../provided_port/swap.interface';
import { SwapOutAmountResponse, SwapQuoteResponse } from '../response.type';
import { HTTP_CLIENT } from 'src/module/http-client.module';

@Injectable()
export class OneInchService extends SwapService implements ISwapService{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined
    // TODO: 추후에 CacheRegistryService를 하나 만든다.  그곳에서 로컬 캐시(Map<string, any>)를 사용하던 redis를 사용하던 한다.
    // 토큰 정보 캐시: { chainId_tokenAddress: Token }
    private tokenCache = new Map<string, Token>()

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        private readonly configService: ConfigService,
    ) {
        // TODO: https://api.1inch.com/token/v1.3/multi-chain/supported-chains + viem/chains의 chains를 섞어서 supportingChains를 만든다.
        const supportingChains = [
            {id: ChainId.EthereumMain, name: "Ethereum Main", testnet: false},
            {id: ChainId.ArbitrumMain, name: "Arbitrum Main", testnet: false},
            {id: ChainId.AvalancheMain, name: "Avalanche Main", testnet: false},
            {id: ChainId.BaseMain, name: "Base Main", testnet: false},
            {id: ChainId.BnBMain, name: "BnB Main", testnet: false},
            {id: ChainId.ZkSyncMain, name: "ZkSync Main", testnet: false},
            {id: ChainId.GnosisMain, name: "Gnosis Main", testnet: false},
            {id: ChainId.OptimismMain, name: "Optimism Main", testnet: false},
            {id: ChainId.PolygonMain, name: "Polygon Main", testnet: false},
            {id: ChainId.LineaMain, name: "Linea Main", testnet: false},
            {id: ChainId.SonicMain, name: "Sonic Main", testnet: false},
            {id: ChainId.UnichainMain, name: "Unichain Main", testnet: false},
        ]

        super(supportingChains, []);
    }

    private async fetchTokenInfoUsingApi(chainId: number, tokenAddress: EvmAddress): Promise<OneInchTokenData | undefined> {
        const url = `${this.oneInchBaseUrl}/token/v1.4/${chainId}/custom/${tokenAddress.getAddress()}`
        return await this.fetchFromApi<OneInchTokenData>(url)
    }

    private getTokenCacheKey(chainId: number, tokenAddress: EvmAddress): string {
        return `${chainId}_${tokenAddress.getAddress()}`
    }

    // Generic API 호출 헬퍼 - Authorization 헤더와 에러 처리 자동화
    private async fetchFromApi<T>(url: string, options?: { params?: Record<string, any> }): Promise<T | undefined> {
        try {
            const response = await this.httpClient.get<T>(url, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                ...options,
            })

            if (response.isError) {
                return undefined
            }

            return response.data
        } catch (error) {
            return undefined
        }
    }

    async onModuleInit(): Promise<void> {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
        return this.settingSupportingTokens()
    }

    // 매일 새벽 3시에 한번씩 초기화
    @Cron('0 0 3 * * *')
    private async settingSupportingTokens(): Promise<void> {
        try {
            const tokens = await this.getAllSupportingTokens();
            this.setSupportingTokens(tokens);
        } catch (error) {
            throw error; 
        }
    }

    async getAllSupportingTokens(): Promise<Token[]> {
        const supportingChains = this.getSupportingChain();
        const promises = supportingChains.map((chainInfo) => {
            return this.getSupportingTokenByChainId(chainInfo.id);
        });
        const tokensByChain = await Promise.all(promises);
        return tokensByChain.flat();
    }

    private async getSupportingTokenByChainId(chainId: number): Promise<Token[]> {
        const response = await this.fetchFromApi<OneInchTokensResponse>(
            `https://api.1inch.com/swap/v6.1/${chainId}/tokens`,
        );
        const chainInfo = this.getChainInfo(chainId)
        if (!response || !chainInfo) return []
        
        return Object.values(response.tokens).map(
            (tokenData) => Token.fromOneInchTokenData(tokenData, chainInfo),
        );
    }

    async getQuote(quoteRequest: SwapQuoteRequest): Promise<SwapQuoteResponse | undefined> {
        if (quoteRequest.type === 'cross-chain') {
            throw new Error('Method not implemented.');
        }

        return this.getClassicSwapQuote(quoteRequest)
    }

    private async getClassicSwapQuote(request: SameChainSwapQuoteRequest): Promise<SwapQuoteResponse | undefined> {
        if (!this.validateSimpleSwapRequest(request)) {
            return undefined
        }
        const response = await this.fetchFromApi<ClassicSwapQuoteResponse>(
            `${this.oneInchBaseUrl}/swap/v6.1/${request.chain.id}/quote`,
            {
                params : {
                    src: request.srcToken.address.getAddress(),
                    dst: request.dstToken.address.getAddress(),
                    amount: request.srcToken.convertToBigIntAmount(request.amount).toString(),
                    includeTokensInfo: true,
                    includeProtocols: true,
                    includeGas: true,
                }
            },
        );
        if (!response) return undefined

        return {
            amount: BigInt(response.dstAmount),
            token: request.dstToken
        }
    }

    async getSwapOutAmount(request: SwapOutAmountRequest): Promise<SwapOutAmountResponse | undefined> {
        const response = await this.fetchFromOneInchHistoryApi(request.address, request.chainId)
        if (!response) return undefined

        const swapOutTokenInfo = this.extractSwapOutTokenInfo(response, request.txHash)
        if (!swapOutTokenInfo) return undefined

        const tokenInfo = await this.fetchTokenInfoWithCache(request.chainId, new EvmAddress(swapOutTokenInfo.address))
        if (!tokenInfo) return undefined

        return {
            amount: BigInt(swapOutTokenInfo.amount),
            token: tokenInfo
        }
    }

    private async fetchFromOneInchHistoryApi(address: EvmAddress, chainId: number): Promise<OneInchHistoryResponseDto | undefined> {
        const currentTimestampMs: number = Date.now();
        const response = await this.fetchFromApi<OneInchHistoryResponseDto>(
            `${this.oneInchBaseUrl}/history/v2.0/history/${address}/events`,
            {
                params : {
                    limit: 10,
                    chainId: chainId,
                    fromTimestampMs: currentTimestampMs - 1000*60*10, // 10분전 부터
                    toTimestampMs: currentTimestampMs + - 1000*60*5// 지금까지
                }
            },
        );
        return response
    }

    private extractSwapOutTokenInfo(response: OneInchHistoryResponseDto, txHash: EvmTxHash): TokenActionDto | undefined {
        const historyEventDto = response.items.find((dto) => {
            dto.details.txHash.toLowerCase() === txHash.hash.toLowerCase()
        })
        if (historyEventDto === undefined || historyEventDto.details.status !== 'completed' || !historyEventDto.details.type.startsWith('SwapExact')) {
            return undefined
        }
        const swapOutTokenActionDto = historyEventDto.details.tokenActions.find((tokenAction)=> {
            tokenAction.direction === 'In'
        })
        return swapOutTokenActionDto
    }

    private async fetchTokenInfoWithCache(chainId: number, tokenAddress: EvmAddress): Promise<Token | undefined> {
        const cacheKey = this.getTokenCacheKey(chainId, tokenAddress)
        
        const cachedToken = this.tokenCache.get(cacheKey)
        if (!cachedToken) return undefined

        const tokenData = await this.fetchTokenInfoUsingApi(chainId, tokenAddress)
        if (!tokenData) return undefined

        const chainInfo = this.getChainInfo(chainId)
        if (!chainInfo) return undefined

        const token = Token.fromOneInchTokenData(tokenData, chainInfo)
        this.tokenCache.set(cacheKey, token)
        return token
    }
}

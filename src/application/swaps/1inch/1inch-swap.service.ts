import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IHttpClient } from '../../common/required_port/http-client.interface';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { EvmAddress } from 'src/domain/evm-address.class';
import { SameChainSwapQuoteRequest, SwapOutAmountRequest, SwapQuoteRequest } from '../request.type';
import { ISwapService } from '../provided_port/swap.interface';
import { SwapOutAmountResponse, SwapQuoteResponse } from '../response.type';
import { HTTP_CLIENT } from 'src/module/http-client.module';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/info-provider.module';
import * as defiInfoProviderInterface from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';
import { ClassicSwapQuoteResponse, OneInchHistoryResponseDto, TokenActionDto } from './1inch-response.type';

@Injectable()
export class OneInchService implements ISwapService{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: defiInfoProviderInterface.IDefiProtocolInfoProvider,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit(): Promise<void> {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
    }

    private async validateSimpleSwapRequest(request: SameChainSwapQuoteRequest): Promise<boolean> {
        
        const chainInfo = await this.oneInchInfoProvider.getSupportingChainInfo(request.chain.id)
        if (!chainInfo) return false

        const srcToken = await this.oneInchInfoProvider.getSupportingToken(request.chain.id, request.srcToken.address)
        if (!srcToken) return false

        const dstToken = await this.oneInchInfoProvider.getSupportingToken(request.chain.id, request.dstToken.address)
        if (!dstToken) return false

        return true
    }

    async getQuote(quoteRequest: SwapQuoteRequest): Promise<SwapQuoteResponse | undefined> {
        if (quoteRequest.type === 'cross-chain') {
            throw new Error('Method not implemented.');
        }

        return this.getClassicSwapQuote(quoteRequest)
    }

    private async getClassicSwapQuote(request: SameChainSwapQuoteRequest): Promise<SwapQuoteResponse | undefined> {
        if (!await this.validateSimpleSwapRequest(request)) {
            return undefined
        }

        const response = await this.httpClient.get<ClassicSwapQuoteResponse>(
            `${this.oneInchBaseUrl}/swap/v6.1/${request.chain.id}/quote`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
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
        if (!response || response.isError) return undefined

        return {
            amount: BigInt(response.data.dstAmount),
            token: request.dstToken
        }
    }

    async getSwapOutAmount(request: SwapOutAmountRequest): Promise<SwapOutAmountResponse | undefined> {
        const response = await this.fetchFromOneInchHistoryApi(request.address, request.chainId)
        if (!response) return undefined

        const swapOutTokenInfo = this.extractSwapOutTokenInfo(response, request.txHash)
        if (!swapOutTokenInfo) return undefined

        const tokenInfo = await this.oneInchInfoProvider.getSupportingToken(request.chainId, new EvmAddress(swapOutTokenInfo.address))
        if (!tokenInfo) return undefined

        return {
            amount: BigInt(swapOutTokenInfo.amount),
            token: tokenInfo
        }
    }

    private async fetchFromOneInchHistoryApi(address: EvmAddress, chainId: number): Promise<OneInchHistoryResponseDto | undefined> {
        const currentTimestampMs: number = Date.now();
        const response = await this.httpClient.get<OneInchHistoryResponseDto>(
            `${this.oneInchBaseUrl}/history/v2.0/history/${address}/events`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                params : {
                    limit: 10,
                    chainId: chainId,
                    fromTimestampMs: currentTimestampMs - 1000*60*10, // 10분전 부터
                    toTimestampMs: currentTimestampMs + - 1000*60*5// 지금까지
                }
            },
        );
        if (!response || response.isError) return undefined
        return response.data
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
}

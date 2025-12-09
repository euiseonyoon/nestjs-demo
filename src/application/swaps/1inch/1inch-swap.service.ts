import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IHttpClient } from '../../common/required_port/http-client.interface';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { EvmAddress } from 'src/domain/evm-address.class';
import { NaiveSameChainSwapQuoteRequest, SwapOutAmountRequest, NaiveSwapQuoteRequest } from '../request.type';
import { ISwapService } from '../provided_port/swap.interface';
import { SwapOutAmountResponse, SwapQuoteResponse } from '../response.type';
import { HTTP_CLIENT } from 'src/module/http-client.module';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/info-provider.module';
import * as defiInfoProviderInterface from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';
import { OneInchHistoryResponseDto, TokenActionDto } from './1inch-response.type';
import { ONE_INCH_SWAP_QUOTER } from 'src/module/swap.quoter.module';
import { type ISwapQuoter } from 'src/application/quoter/swap/provided_port/swap.quoter';
import { SimpleSwapQuoteRequest, type SwapQuoteRequest } from 'src/application/quoter/swap/request.type';

@Injectable()
export class OneInchService implements ISwapService{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined

    constructor(
        @Inject(ONE_INCH_SWAP_QUOTER)
        private readonly oneInchSwapQuoter: ISwapQuoter,
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: defiInfoProviderInterface.IDefiProtocolInfoProvider,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
    }

    async getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteResponse | null> {
        const request = await this.convertRequest(quoteRequest)
        if (!request) return null

        return await this.oneInchSwapQuoter.getQuote(request)
    }

    private async convertRequest(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteRequest | null> {
        if (quoteRequest instanceof NaiveSameChainSwapQuoteRequest) {
            return this.convertToSimpleSwapQuoteRequest(quoteRequest)
        } else {
            return null
        }
    }

    private async validateSimpleSwapRequest(request: NaiveSameChainSwapQuoteRequest): Promise<boolean> {
        const [chainInfo, srcToken, dstToken] = await Promise.all([
            this.oneInchInfoProvider.getSupportingChainInfo(request.chainId),
            this.oneInchInfoProvider.getSupportingToken(request.chainId, request.srcTokenAddress),
            this.oneInchInfoProvider.getSupportingToken(request.chainId, request.dstTokenAddress)
        ])
        if (!chainInfo || !srcToken || !dstToken) return false

        return true
    }

    private async convertToSimpleSwapQuoteRequest(quoteRequest: NaiveSameChainSwapQuoteRequest): Promise<SimpleSwapQuoteRequest | null> {
        if (!await this.validateSimpleSwapRequest(quoteRequest)) {
            return null
        }

        const [srcToken, dstToken] = await Promise.all([
            this.oneInchInfoProvider.getSupportingToken(quoteRequest.chainId, quoteRequest.srcTokenAddress),
            this.oneInchInfoProvider.getSupportingToken(quoteRequest.chainId, quoteRequest.dstTokenAddress)
        ]);

        if (!srcToken || !dstToken) {
            return null
        }
        return new SimpleSwapQuoteRequest(
            srcToken, dstToken, quoteRequest.amount, quoteRequest.slippagePercentStr
        )
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

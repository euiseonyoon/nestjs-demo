import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISwapAmountGetter } from '../provided_port/swap.amount-getter';
import { SwapOutAmountRequest } from '../request.swap-smount';
import { TokenAmount } from 'src/domain/common-defi.type';
import { HTTP_CLIENT } from 'src/module/http-client.tokens';
import { type IHttpClient } from 'src/application/common/required_port/http-client.interface';
import { EvmAddress } from 'src/domain/evm-address.class';
import { OneInchHistoryResponseDto, TokenActionDto } from './1inch.history-api.response';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/info-provider.module';
import { AbstractDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';

@Injectable()
export class OneInchAmoutGetter implements ISwapAmountGetter{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: AbstractDefiProtocolInfoProvider,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
    }

    async getSwapOutAmount(request: SwapOutAmountRequest): Promise<TokenAmount | null> {
        const response = await this.fetchFromOneInchHistoryApi(request.senderAddress, request.chain.id)
        if (!response) return null

        const swapOutTokenInfo = this.extractSwapOutTokenInfo(response, request.txHash)
        if (!swapOutTokenInfo) return null

        const tokenInfo = await this.oneInchInfoProvider.getSupportingToken(request.chain.id, new EvmAddress(swapOutTokenInfo.address))
        if (!tokenInfo) return null

        return {
            amount: BigInt(swapOutTokenInfo.amount),
            token: tokenInfo
        }
    }

    private async fetchFromOneInchHistoryApi(address: EvmAddress, chainId: number): Promise<OneInchHistoryResponseDto | null> {
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

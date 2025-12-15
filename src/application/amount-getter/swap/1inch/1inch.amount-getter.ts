import { Injectable, Inject } from '@nestjs/common';
import { ISwapAmountGetter } from '../provided_port/swap.amount-getter';
import { SwapOutAmountRequest } from '../request.swap-smount';
import { TokenAmount } from 'src/domain/common-defi.type';
import { ONE_INCH_INFO_FETCHER } from 'src/module/module.token';
import { EvmAddress } from 'src/domain/evm-address.class';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/module.token';
import { AbstractDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { type IOneInchInfoFetcher } from 'src/application/defi.info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface';
import { OneInchHistoryResponseDto, TokenActionDto } from 'src/application/defi.info-fetcher/swap/1inch/1inch-swap.info-fetcher.response';

@Injectable()
export class OneInchAmountGetter implements ISwapAmountGetter{
    static readonly TARGET_STATUS = 'completed'

    constructor(
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: AbstractDefiProtocolInfoProvider,
        @Inject(ONE_INCH_INFO_FETCHER)
        private readonly oneInchInfoFetcher: IOneInchInfoFetcher,
    ) {}

    async getSwapOutAmount(request: SwapOutAmountRequest): Promise<TokenAmount | null> {
        const response = await this.oneInchInfoFetcher.fetchSwapOutAmount(request.receiverAddress, request.chain.id)
        if (!response) return null

        const swapOutTokenInfo = this.extractSwapOutTokenInfo(response, request.txHash, request.receiverAddress)
        if (!swapOutTokenInfo) return null

        const tokenInfo = await this.oneInchInfoProvider.getSupportingToken(request.chain.id, new EvmAddress(swapOutTokenInfo.address))
        if (!tokenInfo) return null

        return {
            amount: BigInt(swapOutTokenInfo.amount),
            token: tokenInfo
        }
    }

    private extractSwapOutTokenInfo(response: OneInchHistoryResponseDto, txHash: EvmTxHash, receiverAddress: EvmAddress): TokenActionDto | null {
        const historyEventDto = response.items.find((dto) => 
            dto.details.txHash.toLowerCase() === txHash.hash.toLowerCase()
        )
        if (historyEventDto === undefined || historyEventDto.details.status !== OneInchAmountGetter.TARGET_STATUS) {
            return null
        }
        const receiveAddressStr = receiverAddress.getAddress().toLowerCase()
        const swapOutTokenActionDto = historyEventDto.details.tokenActions.find((tokenAction)=> 
            tokenAction.toAddress.toLowerCase() === receiveAddressStr
        )
        return swapOutTokenActionDto ?? null
    }
}

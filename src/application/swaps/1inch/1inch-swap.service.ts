import { Injectable, Inject } from '@nestjs/common';
import { NaiveSameChainSwapQuoteRequest, NaiveSwapQuoteRequest, NaiveSwapOutAmountRequest } from '../request.type';
import { AbstractSwapService } from '../provided_port/swap.interface';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/module.token';
import { ONE_INCH_SWAP_QUOTER } from 'src/module/module.token';
import { type ISwapQuoter } from 'src/application/quoter/swap/provided_port/swap.quoter';
import { type SwapQuoteRequest } from 'src/application/quoter/swap/request.type';
import { ONE_INCH_SWAP_AMOUNT_GETTER } from 'src/module/module.token';
import { type ISwapAmountGetter } from 'src/application/amount-getter/swap/provided_port/swap.amount-getter';
import { TokenAmount } from 'src/domain/common-defi.type';
import { AbstractDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';

@Injectable()
export class OneInchService extends AbstractSwapService{
    constructor(
        @Inject(ONE_INCH_SWAP_QUOTER)
        private readonly oneInchSwapQuoter: ISwapQuoter,
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: AbstractDefiProtocolInfoProvider,
        @Inject(ONE_INCH_SWAP_AMOUNT_GETTER)
        private readonly oneInchAmountGetter: ISwapAmountGetter
    ) {
        super(oneInchInfoProvider)
    }

    async getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<TokenAmount | null> {
        const request = await this.convertQuoteRequest(quoteRequest)
        if (!request) return null

        return await this.oneInchSwapQuoter.getQuote(request)
    }

    private async convertQuoteRequest(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteRequest | null> {
        if (quoteRequest instanceof NaiveSameChainSwapQuoteRequest) {
            return this.convertToSimpleSwapQuoteRequest(quoteRequest)
        } else {
            return null
        }
    }

    async getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null> {
        const convertedRequest = await this.convertAmountOutRequest(request)
        if (!convertedRequest) return null

        return await this.oneInchAmountGetter.getSwapOutAmount(convertedRequest)
    }
}

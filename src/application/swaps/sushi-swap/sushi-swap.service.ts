import { Injectable, Inject } from '@nestjs/common';
import { NaiveSameChainSwapQuoteRequest, NaiveSwapQuoteRequest, NaiveSwapOutAmountRequest } from '../request.type';
import { ISwapService } from '../provided_port/swap.interface';
import { SUSHI_SWAP_INFO_PROVIDER } from 'src/module/info-provider.module';
import { SUSHI_SWAP_QUOTER } from 'src/module/swap.quoter.module';
import { type ISwapQuoter } from 'src/application/quoter/swap/provided_port/swap.quoter';
import { SimpleSwapQuoteRequest, type SwapQuoteRequest } from 'src/application/quoter/swap/request.type';
import { SUSHI_SWAP_AMOUNT_GETTER } from 'src/module/swap.amount-getter.module';
import { type ISwapAmountGetter } from 'src/application/amount-getter/swap/provided_port/swap.amount-getter';
import { SwapOutAmountRequest } from 'src/application/amount-getter/swap/request.swap-smount';
import { TokenAmount } from 'src/domain/common-defi.type';
import { type IDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';

@Injectable()
export class SushiSwapService implements ISwapService{
    constructor(
        @Inject(SUSHI_SWAP_QUOTER)
        private readonly sushiSwapQuoter: ISwapQuoter,
        @Inject(SUSHI_SWAP_INFO_PROVIDER)
        private readonly sushiSwapInfoProvider: IDefiProtocolInfoProvider,
        @Inject(SUSHI_SWAP_AMOUNT_GETTER)
        private readonly sushiSwapAmountGetter: ISwapAmountGetter
    ) {}

    async getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<TokenAmount | null> {
        const request = await this.convertRequest(quoteRequest)
        if (!request) return null

        return await this.sushiSwapQuoter.getQuote(request)
    }

    private async convertRequest(quoteRequest: NaiveSwapQuoteRequest): Promise<SwapQuoteRequest | null> {
        if (quoteRequest instanceof NaiveSameChainSwapQuoteRequest) {
            return this.convertToSimpleSwapQuoteRequest(quoteRequest)
        } else {
            return null
        }
    }

    private async convertToSimpleSwapQuoteRequest(quoteRequest: NaiveSameChainSwapQuoteRequest): Promise<SimpleSwapQuoteRequest | null> {
        const supportedTokens = await this.sushiSwapInfoProvider.getSupprtedTokens(
            quoteRequest.chainId,
            quoteRequest.chainId,
            quoteRequest.srcTokenAddress,
            quoteRequest.dstTokenAddress,
        )
        if (!supportedTokens) return null
        const srcToken = supportedTokens.srcToken
        const dstToken = supportedTokens.dstToken
        if (!srcToken || !dstToken) {
            return null
        }
        return new SimpleSwapQuoteRequest(
            srcToken, dstToken, quoteRequest.amount, quoteRequest.slippagePercentStr
        )
    }

    async getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null> {
        const convertedRequest = await this.convertAmountOutRequest(request)
        if (!convertedRequest) return null

        return await this.sushiSwapAmountGetter.getSwapOutAmount(convertedRequest)
    }
    
    private async convertAmountOutRequest(request: NaiveSwapOutAmountRequest): Promise<SwapOutAmountRequest | null> {
        const chain = await this.sushiSwapInfoProvider.getSupportingChainInfo(request.chainId);
        if (!chain) return null

        return {
            chain: chain,
            senderAddress: request.senderAddress,
            receiverAddress: request.receiverAddress,
            txHash: request.txHash,
        }
    }
}

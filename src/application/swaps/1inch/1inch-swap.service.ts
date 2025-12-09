import { Injectable, Inject } from '@nestjs/common';
import { NaiveSameChainSwapQuoteRequest, NaiveSwapQuoteRequest, NaiveSwapOutAmountRequest } from '../request.type';
import { ISwapService } from '../provided_port/swap.interface';
import { SwapQuoteResponse } from '../response.type';
import { ONE_INCH_SWAP_INFO_PROVIDER } from 'src/module/info-provider.module';
import { ONE_INCH_SWAP_QUOTER } from 'src/module/swap.quoter.module';
import { type ISwapQuoter } from 'src/application/quoter/swap/provided_port/swap.quoter';
import { SimpleSwapQuoteRequest, type SwapQuoteRequest } from 'src/application/quoter/swap/request.type';
import { ONE_INCH_SWAP_AMOUNT_GETTER } from 'src/module/swap.amount-getter.module';
import { type ISwapAmountGetter } from 'src/application/amount-getter/swap/provided_port/swap.amount-getter';
import { SwapOutAmountRequest } from 'src/application/amount-getter/swap/request.swap-smount';
import { TokenAmount } from 'src/domain/common-defi.type';
import { type IDefiProtocolInfoProvider } from 'src/application/defi.info-provider/provided_port/defi-info-provider.interface';

@Injectable()
export class OneInchService implements ISwapService{
    constructor(
        @Inject(ONE_INCH_SWAP_QUOTER)
        private readonly oneInchSwapQuoter: ISwapQuoter,
        @Inject(ONE_INCH_SWAP_INFO_PROVIDER)
        private readonly oneInchInfoProvider: IDefiProtocolInfoProvider,
        @Inject(ONE_INCH_SWAP_AMOUNT_GETTER)
        private readonly oneInchAmountGetter: ISwapAmountGetter
    ) {}

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

    async getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null> {
        const convertedRequest = await this.convertAmountOutRequest(request)
        if (!convertedRequest) return null

        return await this.oneInchAmountGetter.getSwapOutAmount(convertedRequest)
    }
    
    private async convertAmountOutRequest(request: NaiveSwapOutAmountRequest): Promise<SwapOutAmountRequest | null> {
        const chain = await this.oneInchInfoProvider.getSupportingChainInfo(request.chainId);
        if (!chain) return null

        return {
            chain: chain,
            senderAddress: request.senderAddress,
            receiverAddress: request.receiverAddress,
            txHash: request.txHash,
        }
    }
}

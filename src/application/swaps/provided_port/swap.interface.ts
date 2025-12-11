import { TokenAmount } from "src/domain/common-defi.type";
import { NaiveSameChainSwapQuoteRequest, NaiveSwapOutAmountRequest, NaiveSwapQuoteRequest } from "../request.type";
import { SimpleSwapQuoteRequest } from "src/application/quoter/swap/request.type";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { SwapOutAmountRequest } from "src/application/amount-getter/swap/request.swap-smount";

export abstract class AbstractSwapService {
    constructor(
        protected readonly infoProvider: AbstractDefiProtocolInfoProvider,
    ) {}
    abstract getQuote(quoteRequest: NaiveSwapQuoteRequest): Promise<TokenAmount | null>

    abstract getSwapOutAmount(request: NaiveSwapOutAmountRequest): Promise<TokenAmount | null>

    protected async convertToSimpleSwapQuoteRequest(quoteRequest: NaiveSameChainSwapQuoteRequest): Promise<SimpleSwapQuoteRequest | null> {
        const supportedTokens = await this.infoProvider.getSupprtedTokens(
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
            srcToken, dstToken, quoteRequest.amount, quoteRequest.slippagePercentStr, quoteRequest.maxPriceImpact
        )
    }

    protected async convertAmountOutRequest(request: NaiveSwapOutAmountRequest): Promise<SwapOutAmountRequest | null> {
        const chain = await this.infoProvider.getSupportingChainInfo(request.chainId);
        if (!chain) return null

        return {
            chain: chain,
            senderAddress: request.senderAddress,
            receiverAddress: request.receiverAddress,
            txHash: request.txHash,
        }
    }
}

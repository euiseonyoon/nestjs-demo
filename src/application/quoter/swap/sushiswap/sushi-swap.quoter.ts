import { ISwapQuoter } from "../provided_port/swap.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { CrossSwapQuoteRequest, SimpleSwapQuoteRequest, SwapQuoteRequest } from "../request.type";
import { Inject } from "@nestjs/common";
import { HTTP_CLIENT } from "src/module/module.token";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { SUSHI_SWAP_INFO_PROVIDER } from "src/module/module.token";
import { AbstractDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { SushiSwapQuoteResponse } from "./sushi-swap.quote.response";
import { RouteStatus } from "sushi/evm";

export class SushiSwapQuoter implements ISwapQuoter{
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(SUSHI_SWAP_INFO_PROVIDER)
        private readonly sushiswapInfoProvider: AbstractDefiProtocolInfoProvider,
    ) {}

    async getQuote(quoteRequest: SwapQuoteRequest): Promise<TokenAmount | null> {
        if (quoteRequest instanceof CrossSwapQuoteRequest) {
            throw new Error('Cross Chain swap is not implemented.');
        }

        return this.getSimpleSwapQuote(quoteRequest)
    }

    private async getSimpleSwapQuote(request: SimpleSwapQuoteRequest): Promise<TokenAmount | null> {
        const supportedChain = await this.sushiswapInfoProvider.getSupportingChainInfo(request.srcToken.chain.id)
        if (!supportedChain) return null
        const maxPriceImpactPercent = (request.maxPriceImpactPercent ?? 100)/100
        
        const response = await this.httpClient.get<SushiSwapQuoteResponse>(
            `https://api.sushi.com/quote/v7/${request.srcToken.chain.id}`,
            {
                params : {
                    amount: request.srcToken.convertToBigIntAmount(request.amount).toString(),
                    maxSlippage: Number(request.slippagePercentStr) / 100,
                    maxPriceImpact: maxPriceImpactPercent,
                    tokenIn: request.srcToken.address.getAddress(),
                    tokenOut: request.dstToken.address.getAddress(),
                }
            },
        );
        
        if (!response.data) return null

        if (response.data.status !== RouteStatus.Success) return null
        return {
            amount: BigInt(response.data.assumedAmountOut),
            token: request.dstToken
        }
    }
}

import { ISwapQuoter } from "../provided_port/swap.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { CrossSwapQuoteRequest, SimpleSwapQuoteRequest, SwapQuoteRequest } from "../request.type";
import { Inject } from "@nestjs/common";
import { HTTP_CLIENT, ONE_INCH_INFO_FETCHER } from "src/module/module.token";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { ConfigService } from "@nestjs/config";
import { type IOneInchInfoFetcher } from "src/application/info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface";

export class OneInchQuoter implements ISwapQuoter{
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        private readonly configService: ConfigService,
        @Inject(ONE_INCH_INFO_FETCHER)
        private readonly oneInchInfoFetcher: IOneInchInfoFetcher,
    ) {}

    async getQuote(quoteRequest: SwapQuoteRequest): Promise<TokenAmount | null> {
        if (quoteRequest instanceof CrossSwapQuoteRequest) {
            throw new Error('Cross Chain swap is not implemented.');
        }

        return this.getClassicSwapQuote(quoteRequest)
    }

    private async getClassicSwapQuote(request: SimpleSwapQuoteRequest): Promise<TokenAmount | null> {
        // quote: dstToken의 decimal이 반영. (0.5이더리움이라면, 50000000000000000)
        const quote = await this.oneInchInfoFetcher.getClassicSwapQuote(
            request.srcToken,
            request.dstToken,
            request.amount,
        )
        return quote ? { amountWei: BigInt(quote), token: request.dstToken } : null;
    }
}

import { ISwapQuoter } from "../provided_port/swap.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { CrossSwapQuoteRequest, SimpleSwapQuoteRequest, SwapQuoteRequest } from "../request.type";
import { Inject } from "@nestjs/common";
import { HTTP_CLIENT } from "src/module/http-client.module";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { ConfigService } from "@nestjs/config";
import { ClassicSwapQuoteResponse } from "./1inch.quote.response";

export class OneInchQuoter implements ISwapQuoter{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit(): Promise<void> {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
    }

    async getQuote(quoteRequest: SwapQuoteRequest): Promise<TokenAmount | null> {
        if (quoteRequest instanceof CrossSwapQuoteRequest) {
            throw new Error('Cross Chain swap is not implemented.');
        }

        return this.getClassicSwapQuote(quoteRequest)
    }

    private async getClassicSwapQuote(request: SimpleSwapQuoteRequest): Promise<TokenAmount | null> {
        const response = await this.httpClient.get<ClassicSwapQuoteResponse>(
            `${this.oneInchBaseUrl}/swap/v6.1/${request.srcToken.chain.id}/quote`,
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
        
        if (!response || response.isError) return null
        return {
            amount: BigInt(response.data.dstAmount),
            token: request.dstToken
        }
    }
}

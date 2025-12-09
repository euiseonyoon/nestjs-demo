import { Inject, Injectable } from "@nestjs/common";
import { IBridgeQuoter } from "../provided_port/bridge.quoter";
import { BridgeQuoteRequest } from "../request.type";
import { TokenAmount } from "src/domain/common-defi.type";
import { StargateQuoteDetailResponse, StargateQuoteResponse } from "./stargate.response";
import { HTTP_CLIENT } from "src/module/http-client.module";
import { STARGATE_BRIDGE_INFO_PROVIDER } from "src/module/info-provider.module";
import { type IStargateInfoProvider } from "src/application/bridges/stargate/required_port/stargate.info-provider";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";

@Injectable()
export class StargateQuoter implements IBridgeQuoter {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(STARGATE_BRIDGE_INFO_PROVIDER)
        private readonly stargateInfoProvider: IStargateInfoProvider,
    ) {}

    async getQuote(request: BridgeQuoteRequest): Promise<TokenAmount | null> {
        const quotesResponse = await this.fetchQuotes(request)
        if (!quotesResponse) {
            return null
        }

        const validQuotes = quotesResponse.quotes.filter(quote => !quote.erorr)
        if (validQuotes.length === 0) {
            return null
        }

        const optimalQuote = this.selectOptimalQuote(validQuotes)
        return {
            amount: BigInt(optimalQuote.dstAmount),
            token: request.dstToken
        }
    }

    private selectOptimalQuote(quotes: StargateQuoteDetailResponse[]): StargateQuoteDetailResponse {
        return quotes.reduce((best, current) => {

            const currentAmount = BigInt(current.dstAmount)
            const bestAmount = BigInt(best.dstAmount)

            // 1. dstAmount가 높은 순대로 
            if (currentAmount > bestAmount) {
                return current
            } else if (currentAmount < bestAmount) {
                return best
            }

            // 2. dstAmount가 같다면 estimated시간이 적은 순대로
            if (current.duration.estimated < best.duration.estimated) {
                return current
            }

            return best
        })
    }

    private async fetchQuotes(request: BridgeQuoteRequest): Promise<StargateQuoteResponse | undefined> {
        const srcChainKey = this.stargateInfoProvider.convertChainIdToChainKey(request.srcToken.chain.id)
        const dstChainKey = this.stargateInfoProvider.convertChainIdToChainKey(request.dstToken.chain.id)
        if (!srcChainKey || !dstChainKey) return undefined

        const response = await this.httpClient.get<StargateQuoteResponse>(
            "https://stargate.finance/api/v1/quotes", 
            {
                params : {
                    srcToken: request.srcToken.address.getAddress(),
                    dstToken: request.dstToken.address.getAddress(),
                    srcAddress: request.senderAddresss.getAddress(),
                    dstAddress: request.receiverAddress.getAddress(),
                    srcChainKey: srcChainKey,
                    dstChainKey: dstChainKey,
                    srcAmount: request.amount.toString(),
                    dstAmountMin: request.amount.toString(),
                }
            }
        )
        if (!response || response.isError) return undefined
        return response.data
    }
}

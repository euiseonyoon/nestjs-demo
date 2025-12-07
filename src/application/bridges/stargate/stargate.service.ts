import { Inject, Injectable } from "@nestjs/common";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { StargateQuoteDetailResponse, StargateQuoteResponse } from "./stargate.response";
import { IBridgeService } from "../provided_port/bridge.interface";
import { BridgeHistoryRequest, BridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse, BridgeQuoteResponse } from "../response.type";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { HTTP_CLIENT } from "src/module/http-client.module";
import { LAYER_ZERO_SERVICE } from "src/module/bridge-sub.module";
import { type ILayerZeroService } from "./required_port/layer-zero.interface";
import { STARGATE_BRIDGE_INFO_PROVIDER } from "src/module/info-provider.module";
import { type IStargateInfoProvider } from "./required_port/stargate.info-provider";

@Injectable()
export class StargateService implements IBridgeService {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(LAYER_ZERO_SERVICE)
        private readonly layerZeroService: ILayerZeroService,
        @Inject(STARGATE_BRIDGE_INFO_PROVIDER)
        private readonly stargateInfoProvider: IStargateInfoProvider,
    ) {}

    async getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null> {
        const data = await this.layerZeroService.fetchBridgeInfo(request.srcTxHash)
        if (!data) return null
        if(data.status.name != 'DELIVERED') {
            return { status: data.status.name, bridgeOutAmount: null};
        }
        
        const receipt = await this.layerZeroService.getTxReceiptUsingDstInfo(data.pathway.dstEid, new EvmTxHash(data.destination.tx.txHash))
        if (!receipt) return null
        
        const bridgeOutAmount = await this.layerZeroService.getBridgeOutAmountFromReceipt(receipt)
        if (!bridgeOutAmount) return null

        return {
            status: data.status.name,
            bridgeOutAmount: {
                amount: bridgeOutAmount,
                token: request.dstToken
            }
        }
    }
    
    async getQuote(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse | undefined> {
        const quotesResponse = await this.fetchQuotes(request)
        if (!quotesResponse) {
            return undefined
        }

        const validQuotes = quotesResponse.quotes.filter(quote => !quote.erorr)
        if (validQuotes.length === 0) {
            return undefined
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

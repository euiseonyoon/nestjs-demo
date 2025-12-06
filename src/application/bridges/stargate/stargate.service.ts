import { Inject, Injectable } from "@nestjs/common";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { StargateChainResponse, StargateQuoteDetailResponse, StargateQuoteResponse } from "./stargate.response";
import { Cron } from "@nestjs/schedule";
import { IBridgeService } from "../provided_port/bridge.interface";
import { BridgeHistoryRequest, BridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse, BridgeQuoteResponse } from "../response.type";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { HTTP_CLIENT } from "src/module/http-client.module";
import { LAYER_ZERO_SERVICE } from "src/module/bridge-sub.module";
import { type ILayerZeroService } from "./required_port/layer-zero.interface";

@Injectable()
export class StargateService implements IBridgeService {
    // TODO: 하위의 정보들은 나중에 cache registry에 등록하던지 한다.
    private chainIdChainKeyMap = new Map<number, string>()
    private chainKeyChainIdMap = new Map<string, number>()

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(LAYER_ZERO_SERVICE)
        private readonly layerZeroService: ILayerZeroService
    ) {
        this.refreshChainKeyMap()
    }

    // 매일 새벽 3시에 한번씩 초기화
    @Cron('0 0 3 * * *')
    async refreshChainKeyMap() {
        const chainList = await this.getChains()
        chainList?.chains.forEach((chainDetail)=> {
            if (chainDetail.chainType === 'evm') {
                const chainId = chainDetail.chainId
                const chainKey = chainDetail.chainKey

                this.chainIdChainKeyMap.set(chainId, chainKey)
                this.chainKeyChainIdMap.set(chainKey, chainId)
            }
        })
    }

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

    async getChains(): Promise<StargateChainResponse | undefined> {
        const response = await this.httpClient.get<StargateChainResponse>(
            "https://stargate.finance/api/v1/chains", 
        )
        if (!response) return undefined
        if (response.isError) return undefined

        return response.data
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
        const srcChainKey = this.chainIdChainKeyMap.get(request.srcToken.chain.id)
        const dstChainKey = this.chainIdChainKeyMap.get(request.dstToken.chain.id)
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

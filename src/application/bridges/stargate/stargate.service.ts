import { Inject, Injectable } from "@nestjs/common";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { LayerZeroScanBridgeData, LayerZeroScanBridgeResponse, StargateChainResponse, StargateQuoteDetailResponse, StargateQuoteResponse } from "./stargate.response";
import { Cron } from "@nestjs/schedule";
import { IBridgeService } from "../bridge.interface";
import { BridgeHistoryRequest, BridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse, BridgeQuoteResponse } from "../response.type";
import { type ITxService } from "src/application/transaction/provided_port/tx.provided-port";
import { EvmTxHash } from "src/common/evm-tx-hash.class";
import { TX_SERVICE } from "src/module/tx.module";
import { HTTP_CLIENT } from "src/module/http-client.module";
import { TransactionReceipt } from "viem";

@Injectable()
export class StargateService implements IBridgeService {
    // TODO: 하위의 정보들은 나중에 cache registry에 등록하던지 한다.
    private chainIdChainKeyMap = new Map<number, string>()
    private chainKeyChainIdMap = new Map<string, number>()
    private eidToChainIdMap = new Map<number, number>()

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(TX_SERVICE)
        private readonly txService: ITxService
    ) {
        this.refreshChainKeyMap()
        this.refreshLayerZeroMetadata()
        const stop = 1
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

    // LayerZero EID → Chain ID 매핑 초기화 (매일 새벽 4시)
    @Cron('0 0 4 * * *')
    async refreshLayerZeroMetadata() {
        const url = 'https://metadata.layerzero-api.com/v1/metadata'
        const response = await this.httpClient.get<Record<string, any>>(url)

        if (!response || response.isError) {
            console.error('Failed to fetch LayerZero metadata')
            return
        }

        // 각 체인의 메타데이터를 순회하며 EID → Chain ID 매핑 구축
        for (const [chainKey, chainData] of Object.entries(response.data)) {
            // EVM 체인만 처리
            if (chainData.chainDetails?.chainType === 'evm') {
                // V2 deployment 찾기
                const v2Deployment = chainData.deployments?.find(
                    (d: any) => d.version === 2
                )

                if (v2Deployment?.eid && chainData.chainDetails?.nativeChainId) {
                    this.eidToChainIdMap.set(
                        v2Deployment.eid,
                        chainData.chainDetails.nativeChainId
                    )
                }
            }
        }
    }

    async getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>{
        const data = await this.fetchBridgeInfoFromLayerZero(request.srcTxHash)
        if (!data) return null
        if(data.status.name != 'DELIVERED') {
            return { status: data.status.name, bridgeOutAmount: null}
        }

        const dstTxHash = data.destination.tx.txHash
        const chainId = this.convertEidToChainId(data.pathway.dstEid)
        if (!chainId) return null
        const receipt = await this.txService.getTxReceipt(new EvmTxHash(dstTxHash), chainId)
        if (!receipt) return null
        
        const bridgeOutAmount = await this.getBridgeOutAmountFromReceipt(receipt)
        if (!bridgeOutAmount) return null

        return {
            status: data.status.name,
            bridgeOutAmount: {
                amount: bridgeOutAmount,
                token: request.dstToken
            }
        }
    }

    private async getBridgeOutAmountFromReceipt(receipt: TransactionReceipt): Promise<bigint | null> {
        // 0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c
        // OFTReceived (index_topic_1 bytes32 guid, uint32 srcEid, index_topic_2 address toAddress, uint256 amountReceivedLD)
        const targetEvent = receipt.logs.find((log)=> {
            log.topics[0] === "0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c"
        })
        if (!targetEvent) return null

        // example
        // 0x
        // 0000000000000000000000000000000000000000000000000000000000007595. // srcEid
        // 0000000000000000000000000000000000000000000000001be0dc9cd7c10000  // amountReceivedLD
        return BigInt("0x" + targetEvent.data.slice(-64));
    }

    private async fetchBridgeInfoFromLayerZero(srcTxHash: EvmTxHash): Promise<LayerZeroScanBridgeData | null> {
        const url = `https://scan.layerzero-api.com/v1/messages/tx/${srcTxHash.hash}`
        const response = await this.httpClient.get<LayerZeroScanBridgeResponse>(url)
        if(!response || response.isError) return null
        if (response.data.data.length < 1) return null
        
        return response.data.data[0]
    }

    private convertEidToChainId(eid: number): number | null {
        const chainId = this.eidToChainIdMap.get(eid)

        if (chainId !== undefined) {
            return chainId
        }
        // // 캐시 미스 시 비동기로 refresh 트리거 (블로킹하지 않음)
        // this.refreshLayerZeroMetadata().catch(err =>
        //     console.error('Failed to refresh LayerZero metadata:', err)
        // )
        return null
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

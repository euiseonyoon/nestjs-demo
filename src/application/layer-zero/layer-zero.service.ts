import { Inject, Injectable } from "@nestjs/common"
import { HTTP_CLIENT } from "src/module/module.token"
import { TX_SERVICE } from "src/module/module.token"
import { type ITxService } from "../transaction/provided_port/tx.provided-port"
import { type IHttpClient } from "../common/required_port/http-client.interface"
import { EvmTxHash } from "src/domain/evm-tx-hash.class"
import { LayerZeroScanBridgeData, LayerZeroScanBridgeResponse } from "./response.type"
import { decodeEventLog, TransactionReceipt } from "viem"
import { Cron } from "@nestjs/schedule"
import { ILayerZeroService } from "../bridges/stargate/required_port/layer-zero.interface"
import { LAYERZERO_OFT_ABI } from "./layer-zero.abi"
import { LAYERZERO_TOPICS } from "./layer-zero.topics"

@Injectable()
export class LayerZeroService implements ILayerZeroService {
    // TODO: 하위의 정보들은 나중에 cache registry에 등록하던지 한다.
    private eidToChainIdMap = new Map<number, number>()

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(TX_SERVICE)
        private readonly txService: ITxService
    ) {
        this.refreshLayerZeroMetadata()
    }

    // LayerZero EID → Chain ID 매핑 초기화 (매일 새벽 4시)
    @Cron('0 0 4 * * *')
    async refreshLayerZeroMetadata() {
        const url = 'https://metadata.layerzero-api.com/v1/metadata'
        const response = await this.httpClient.get<Record<string, any>>(url)

        if (!response.data) {
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

    async getTxReceiptUsingDstInfo(dstEid: number, dstTxHash: EvmTxHash): Promise<TransactionReceipt | null> {
        const chainId = this.convertEidToChainId(dstEid)
        if (!chainId) return null

        const receipt = await this.txService.getTxReceipt(dstTxHash, chainId)
        if (!receipt) return null

        return receipt
    }

    async fetchBridgeInfo(srcTxHash: EvmTxHash): Promise<LayerZeroScanBridgeData | null> {
        const url = `https://scan.layerzero-api.com/v1/messages/tx/${srcTxHash.hash}`
        const response = await this.httpClient.get<LayerZeroScanBridgeResponse>(url)
        if(response.isErrorResponse || response.isNetworkError) return null

        if (response.data.data.length < 1) return null
        return response.data.data[0]
    }

    async getBridgeOutAmountFromReceipt(receipt: TransactionReceipt): Promise<bigint | null> {
        const targetLog = receipt.logs.find(log => log.topics[0] === LAYERZERO_TOPICS.OFT_RECEIVED)
        if (!targetLog) return null

        try {
            const { args } = decodeEventLog({
                abi: LAYERZERO_OFT_ABI,
                eventName: 'OFTReceived',
                data: targetLog.data,
                topics: targetLog.topics,
            })
            return args.amountReceivedLD
        } catch {
            return null
        }
    }

    convertEidToChainId(eid: number): number | null {
        return this.eidToChainIdMap.get(eid) ?? null
    }
}

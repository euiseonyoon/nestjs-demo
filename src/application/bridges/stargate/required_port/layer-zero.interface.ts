import { LayerZeroScanBridgeData } from "src/application/layer-zero/response.type";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { TransactionReceipt } from "viem";

export interface ILayerZeroService {
    fetchBridgeInfo(srcTxHash: EvmTxHash): Promise<LayerZeroScanBridgeData | null>

    getTxReceiptUsingDstInfo(dstEid: number, dstTxHash: EvmTxHash): Promise<TransactionReceipt | null>

    getBridgeOutAmountFromReceipt(receipt: TransactionReceipt): Promise<bigint | null>
}

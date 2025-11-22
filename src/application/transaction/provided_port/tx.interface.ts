import { Hash, TransactionReceipt } from "viem";

export interface TxService {
    getTxReceipt(txHash: Hash, chainId: number): Promise<TransactionReceipt>;
}

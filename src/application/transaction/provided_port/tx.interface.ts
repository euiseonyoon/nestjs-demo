import { EvmTxHash } from 'src/common/evm-tx-hash.class';
import { TransactionReceipt } from 'viem';

export interface TxService {
    getTxReceipt(txHash: EvmTxHash, chainId: number): Promise<TransactionReceipt | null>;
}

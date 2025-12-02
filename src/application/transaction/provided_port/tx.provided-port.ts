import { EvmTxHash } from 'src/common/evm-tx-hash.class';
import { TransactionReceipt } from 'viem';

export interface ITxService {
    getTxReceipt(txHash: EvmTxHash, chainId: number): Promise<TransactionReceipt | null>;
}

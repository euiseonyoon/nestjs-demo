import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { TransactionReceipt } from 'viem';

export interface ITxService {
    getTxReceipt(txHash: EvmTxHash, chainId: number): Promise<TransactionReceipt | null>;
}

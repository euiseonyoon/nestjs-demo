import { TxHash } from "src/domain/transaction/domain.txHash";

export interface TxService {
    getTxReceipt(txHash: TxHash): void;
}

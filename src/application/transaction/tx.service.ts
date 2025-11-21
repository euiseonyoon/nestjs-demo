import { Injectable } from "@nestjs/common";
import { TxService } from "./provided_port/tx.interface";
import { TxHash } from "src/domain/transaction/domain.txHash";

@Injectable()
export class TxServiceImpl implements TxService {
    getTxReceipt(txHash: TxHash): void {
        // 실제 구현
    }
}

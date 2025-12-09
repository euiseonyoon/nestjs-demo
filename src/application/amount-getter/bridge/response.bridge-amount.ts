import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { Token } from "src/domain/token.class";

export type BridgeHistoryRequest = {
    srcToken: Token,
    dstToken: Token,
    srcTxHash: EvmTxHash,
}

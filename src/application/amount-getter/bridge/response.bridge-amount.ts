import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { Token } from "src/domain/token.class";

export type BridgeAmountRequest = {
    srcToken: Token,
    dstToken: Token,
    srcTxHash: EvmTxHash,
}

import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { generateRandomHexString } from "./random.hex.generator";

export function createTestEvmTxHash(
    hash?: string,
): EvmTxHash {
    return new EvmTxHash(
        hash ?? generateRandomHexString(64)
    )
}

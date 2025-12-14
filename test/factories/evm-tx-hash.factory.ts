import { EvmTxHash } from "src/domain/evm-tx-hash.class";

export function createTestEvmTxHash(
    hash?: string,
): EvmTxHash {
    return new EvmTxHash(
        hash ?? "0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234"
    )
}

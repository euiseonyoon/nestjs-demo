import { EvmAddress } from "src/domain/evm-address.class";

export function createTestEvmAddress(
    address?: string,
): EvmAddress {
    return new EvmAddress(
        address ?? "0xabcde12345abcde12345abcde12345abcde12345"
    )
}

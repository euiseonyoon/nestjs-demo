import { EvmAddress } from "src/domain/evm-address.class";
import { generateRandomHexString } from "./random.hex.generator";

export function createTestEvmAddress(
    address?: string,
): EvmAddress {
    return new EvmAddress(
        address ?? generateRandomHexString(40)
    )
}

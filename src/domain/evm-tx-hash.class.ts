import { Hash } from "viem";

export class EvmTxHash {
    public readonly hash: string

    private static readonly HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

    constructor(hash: string) {
        if (!EvmTxHash.HASH_REGEX.test(hash)) {
            throw new Error(`Invalid EVM transaction hash format: ${hash}. 
                Must be 66 characters long (including '0x') and hexadecimal.`);
        }
        this.hash = hash.toLowerCase();
    }

    toViemHash(): Hash {
        return this.hash as Hash
    }
}

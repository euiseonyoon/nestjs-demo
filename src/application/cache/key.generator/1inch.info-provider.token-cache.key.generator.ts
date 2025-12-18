import { Injectable } from "@nestjs/common";
import { ICacheKeyGenerator } from "./provided_port/cache.key.generator";
import { EvmAddress } from "src/domain/evm-address.class";

export type KeyInput = {
    chainId: number,
    tokenAddress: EvmAddress
}

@Injectable()
export class OneInchInfoProviderTokenCacheKeyGenerator implements ICacheKeyGenerator<string, KeyInput> {
    genKey(intput: KeyInput): string {
        const { chainId, tokenAddress } = intput
        return `${chainId}-${tokenAddress.address}`
    }
}

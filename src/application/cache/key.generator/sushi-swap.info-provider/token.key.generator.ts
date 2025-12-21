import { Injectable } from "@nestjs/common";
import { ICacheKeyGenerator } from "../provided_port/cache.key.generator";
import { ChainCacheKeyInput } from "../chain.cache.input";

@Injectable()
export class SushiSwapInfoProviderTokenCacheKeyGenerator implements ICacheKeyGenerator<string, ChainCacheKeyInput> {
    genKey(intput: ChainCacheKeyInput): string {
        const { chainId, tokenAddress } = intput
        return `token:sushi-swap:${chainId}-${tokenAddress.address}`
    }
}

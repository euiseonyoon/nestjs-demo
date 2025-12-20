import { Injectable } from "@nestjs/common";
import { ICacheKeyGenerator } from "../provided_port/cache.key.generator";

@Injectable()
export class OneInchInfoProviderChainInfoCacheKeyGenerator implements ICacheKeyGenerator<string, number> {
    // input: chainId
    genKey(intput: number): string {
        return `chain:${intput}`
    }
}

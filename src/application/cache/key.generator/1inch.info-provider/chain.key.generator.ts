import { Injectable } from "@nestjs/common";
import { ICacheKeyGenerator } from "../provided_port/cache.key.generator";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class OneInchInfoProviderChainInfoCacheKeyGenerator implements ICacheKeyGenerator<number, ChainInfo> {
    genKey(intput: ChainInfo): number {
        return intput.id
    }
}

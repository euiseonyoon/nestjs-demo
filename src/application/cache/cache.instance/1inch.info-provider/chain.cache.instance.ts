import { Inject, Injectable } from "@nestjs/common";
import { AbstractCacheInstance } from "../provided_port/cache.instance.interface";
import { type ICacheNotExpirableRepository } from "../../cache.repository/provided_port/cache.repository.interface";
import { ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_REPO } from "src/module/module.token";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class OneInchInfoProviderChainInfoCacheInstance extends AbstractCacheInstance<number, ChainInfo> {
    constructor(
        @Inject(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_REPO)
        cacheRepository: ICacheNotExpirableRepository<number, ChainInfo>
    ) {
        super(cacheRepository)
    }
}

import { Inject, Injectable } from "@nestjs/common";
import { AbstractCacheInstance } from "../provided_port/cache.instance.interface";
import { type ICacheNotExpirableRepository } from "../../cache.repository/provided_port/cache.repository.interface";
import {  STABLE_COIN_CACHE_REPO } from "src/module/module.token";
import { Token } from "src/domain/token.class";

@Injectable()
export class StableCoinInfoProviderChainInfoCacheInstance extends AbstractCacheInstance<string, Set<Token>> {
    constructor(
        @Inject(STABLE_COIN_CACHE_REPO)
        cacheRepository: ICacheNotExpirableRepository<string, Set<Token>>
    ) {
        super(cacheRepository)
    }
}

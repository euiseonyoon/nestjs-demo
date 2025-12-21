import { Inject, Injectable } from "@nestjs/common";
import { Token } from "src/domain/token.class";
import { AbstractCacheInstance } from "../provided_port/cache.instance.interface";
import { type ICacheNotExpirableRepository } from "../../cache.repository/provided_port/cache.repository.interface";
import { SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_REPO } from "src/module/module.token";

@Injectable()
export class SushiSwapInfoProviderTokenCacheInstance extends AbstractCacheInstance<string, Token> {
    constructor(
        @Inject(SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_REPO)
        cacheRepository: ICacheNotExpirableRepository<string, Token>
    ) {
        super(cacheRepository)
    }
}

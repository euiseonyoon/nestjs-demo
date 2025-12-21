import { Injectable } from "@nestjs/common";
import { ICacheExpirableRepository, ICacheNotExpirableRepository } from "../provided_port/cache.repository.interface";
import { Token } from "src/domain/token.class";

@Injectable()
export class SushiSwapInfoProviderTokenCacheRepo implements ICacheNotExpirableRepository<string, Token> {
    private localMapCacheRepo = new Map<string, Token>()

    async save(key: string, data: Token): Promise<void> {
        this.localMapCacheRepo.set(key, data)
    }
    async delete(key: string): Promise<void> {
        this.localMapCacheRepo.delete(key)
    }

    async get(key: string): Promise<Token | null> {
        return this.localMapCacheRepo.get(key) ?? null
    }

    isExpirable(): this is ICacheExpirableRepository<any, any> {
        return false
    }
}

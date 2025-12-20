import { Injectable } from "@nestjs/common";
import { ICacheExpirableRepository, ICacheNotExpirableRepository } from "../provided_port/cache.repository.interface";
import { Token } from "src/domain/token.class";

@Injectable()
export class StableCoinInfoProviderStableCoinCacheRepo implements ICacheNotExpirableRepository<string, Set<Token>> {
    private localMapCacheRepo = new Map<string, Set<Token>>()

    async save(key: string, data: Set<Token>): Promise<void> {
        this.localMapCacheRepo.set(key, data)
    }
    async delete(key: string): Promise<void> {
        this.localMapCacheRepo.delete(key)
    }

    async get(key: string): Promise<Set<Token> | null> {
        return this.localMapCacheRepo.get(key) ?? null
    }

    isExpirable(): this is ICacheExpirableRepository<any, any> {
        return false
    }
}

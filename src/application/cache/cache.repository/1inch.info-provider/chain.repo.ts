import { Injectable } from "@nestjs/common";
import { ICacheExpirableRepository, ICacheNotExpirableRepository } from "../provided_port/cache.repository.interface";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class OneInchInfoProviderChainInfoCacheRepo implements ICacheNotExpirableRepository<string, ChainInfo> {
    private localMapCacheRepo = new Map<string, ChainInfo>()

    async save(key: string, data: ChainInfo): Promise<void> {
        this.localMapCacheRepo.set(key, data)
    }
    async delete(key: string): Promise<void> {
        this.localMapCacheRepo.delete(key)
    }

    async get(key: string): Promise<ChainInfo | null> {
        return this.localMapCacheRepo.get(key) ?? null
    }

    isExpirable(): this is ICacheExpirableRepository<any, any> {
        return false
    }
}

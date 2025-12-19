import { Injectable } from "@nestjs/common";
import { ICacheExpirableRepository, ICacheNotExpirableRepository } from "../provided_port/cache.repository.interface";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class OneInchInfoProviderChainInfoCacheRepo implements ICacheNotExpirableRepository<number, ChainInfo> {
    private localMapCacheRepo = new Map<number, ChainInfo>()

    async save(key: number, data: ChainInfo): Promise<void> {
        this.localMapCacheRepo.set(key, data)
    }
    async delete(key: number): Promise<void> {
        this.localMapCacheRepo.delete(key)
    }

    async get(key: number): Promise<ChainInfo | null> {
        return this.localMapCacheRepo.get(key) ?? null
    }

    isExpirable(): this is ICacheExpirableRepository<any, any> {
        return false
    }
}

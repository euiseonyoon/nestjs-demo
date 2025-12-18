import { DurationMs } from "src/utils/time/duration"
import { ICacheExpirableRepository, ICacheNotExpirableRepository } from "../../cache.repository/provided_port/cache.repository.interface"

export type CacheRepositoryType<TKey, TData> = 
    ICacheExpirableRepository<TKey, TData> | 
    ICacheNotExpirableRepository<TKey, TData>

export abstract class AbstractCacheInstance<TKey, TData> {
    constructor(
        protected readonly cacheRepo: CacheRepositoryType<TKey, TData>,
    ) {}

    async save(key: TKey, data: TData, ttl?: DurationMs | null): Promise<void> {
        if (this.cacheRepo.isExpirable()) {
            await this.cacheRepo.save(key, data, ttl)
        } else {
            await this.cacheRepo.save(key, data)
        }
    }

    async get(key: TKey): Promise<TData | null> {
        return this.cacheRepo.get(key)
    }

    async delete(key: TKey): Promise<void> {
        return this.cacheRepo.delete(key)
    }
}

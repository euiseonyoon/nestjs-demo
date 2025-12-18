import { AbstractCacheInstance } from "../../cache.instance/provided_port/cache.instance.interface"

export interface ICacheRegistry {
    getCacheInstance<TKey, TData>(cacheInstanceKey: Symbol): AbstractCacheInstance<TKey, TData> | null

    addCacheInstance<TKey, TData>(
        cacheInstanceKey: Symbol,
        cacheInstance: AbstractCacheInstance<TKey, TData>,
    ): void

    deleteCacheInstance(cacheInstanceKey: Symbol): void
}

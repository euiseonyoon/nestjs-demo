import { Injectable } from "@nestjs/common";
import { ICacheRegistry } from "./provided_port/cache.registry.interface";
import { AbstractCacheInstance } from "../cache.instance/provided_port/cache.instance.interface";

@Injectable()
export class CacheRegistry implements ICacheRegistry {
    private cacheInstanceMap: Map<Symbol, AbstractCacheInstance<any, any>>

    getCacheInstance<TKey, TData>(cacheInstanceKey: Symbol): AbstractCacheInstance<TKey, TData> | null {
        return this.cacheInstanceMap.get(cacheInstanceKey) ?? null
    }

    addCacheInstance<TKey, TData>(
        cacheInstanceKey: Symbol,
        cacheInstance: AbstractCacheInstance<TKey, TData>,
    ): void {
        this.cacheInstanceMap.set(cacheInstanceKey, cacheInstance)
    }

    deleteCacheInstance(cacheInstanceKey: Symbol): void {
        this.cacheInstanceMap.delete(cacheInstanceKey)
    }
}

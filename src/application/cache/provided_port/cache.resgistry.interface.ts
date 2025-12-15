export const Ttl = {
    seconds: (n: number) => n * 1000,
    minutes: (n: number) => n * 60 * 1000,
    hours: (n: number) => n * 60 * 60 * 1000,
    days: (n: number) => n * 24 * 60 * 60 * 1000,
    ms: (n: number) => n
} as const;

export interface ICacheKeyGenerator<TData, TKey> {
    generateKey(data: TData): TKey;
}

export interface ICacheRepository<TData, TKey = string> {
    readonly defaultTtl?: number;
    readonly keyGenerator?: ICacheKeyGenerator<TData, TKey>;  // 선택적
    
    get(key: TKey): Promise<TData | null>;
    set(key: TKey, data: TData, ttl?: number): Promise<void>;
    delete(key: TKey): Promise<void>;
    has(key: TKey): Promise<boolean>;
    clear?(): Promise<void>;  // 전체 삭제 (선택)
}

export interface CacheConfig {
    type: 'local' | 'remote_redis' | 'remote_memcached';
    defaultTtl: number;
    // ... 기타 연결 정보
}

export interface ICacheProvider {
    createCacheRepo<TData, TKey>(cacheName: string, config: CacheConfig): ICacheRepository<TData, TKey>;
}

export interface ICacheRegistry {
    get<TData, TKey = string>(cacheName: string): ICacheRepository<TData, TKey> | null;
    
    register<TData, TKey = string>(
        cacheName: string, 
        repository: ICacheRepository<TData, TKey>
    ): void;
    
    unregister(cacheName: string): Promise<void>;
    
    has(cacheName: string): boolean;
    
    clearAll(): Promise<void>;  // 모든 캐시 repo 제거
}
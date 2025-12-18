import { DurationMs } from "src/utils/time/duration";

export interface ICacheExpirableRepository<TKey, TData> 
    extends Omit<ICacheNotExpirableRepository<TKey, TData>, 'save'>, ICacheBaseRepository  {
    readonly defaultTtl: DurationMs
    
    // ttl이 없으면 DefaultTtl로 expire, null이면 영구저장
    save(key: TKey, data: TData, ttl?: DurationMs | null): Promise<void>
}

export interface ICacheNotExpirableRepository<TKey, TData> extends ICacheBaseRepository {
    save(key: TKey, data: TData): Promise<void>;

    delete(key: TKey): Promise<void>

    get(key: TKey): Promise<TData | null>
}

interface ICacheBaseRepository {
    // 타입 가드 (Type Predicate(타입 서술어))
    isExpirable(): this is ICacheExpirableRepository<any, any>;
}
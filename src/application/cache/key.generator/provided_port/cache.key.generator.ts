export interface ICacheKeyGenerator<TKey, TInput> {
    genKey(intput: TInput): TKey
}

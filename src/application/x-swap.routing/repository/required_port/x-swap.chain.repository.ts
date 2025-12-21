import { ChainInfo } from "src/domain/chain-info.type";

export interface IXSwapChainRepository<T, TReturn> {
    saveIfNotExists(chainInfo: ChainInfo, transactional: T | null): Promise<TReturn>
}

import { Token } from "src/domain/token.class";

export interface IXSwapTokenRepository<T, TReturn> {
    makeTokenId(chianId: number, addressStr: string): string
    
    saveIfNotExists(token: Token, transactional: T | null): Promise<TReturn>
}

import { ProtocolInfo } from "src/domain/defi-type.enum";

export interface IXSwapProtocolRepository<T, TReturn> {
    makeProtocolId(protocolInfo: ProtocolInfo): string
    
    saveIfNotExists(protocol: ProtocolInfo, transactional: T | null): Promise<TReturn>
}

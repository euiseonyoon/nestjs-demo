import { ProtocolInfo, ProtocolType } from "src/domain/defi-type.enum";
import { Token } from "src/domain/token.class";

// export interface IXSwapRoutingRepository {
//     saveRoute(srcToken: Token, dstToken: Token, srcChainId: number, dstChainId: number, defiType: ProtocolType): Promise<void>
// }

export interface ITokenRepository {
    save(token: Token): Promise<void>
}

export interface IProtocolRepository {
    save(protocol: ProtocolInfo): Promise<void>
}

export interface IOneHopRepository {
    save(srcToken: Token, dstToken: Token, srcChainId: number, dstChainId: number, protocolInfo: ProtocolInfo): Promise<void>
}

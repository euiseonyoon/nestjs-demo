import { BridgeProtocol, ProtocolInfo, SwapProtocol } from "src/domain/defi-type.enum";
import { Token } from "./token.class";
import { TokenAmount } from "./common-defi.type";

// 라우팅 경로의 한 단계
export type RouteStep = {
    srcToken: Token;
    dstToken: Token;
    protocolInfo: ProtocolInfo;
}

// 전체 경로
export type Route = {
    steps: RouteStep[];
}

export type QuoteRouteStep = {
    srcToken: Token;
    dstToken: Token;
    quote: QuoteResult,
}

export type QuoteRoute = {
    steps: QuoteRouteStep[]
}

export type QuoteResult = 
    | {
        protocol: SwapProtocol,
        quote: TokenAmount
    }
    | {
        protocol: BridgeProtocol,
        quote: TokenAmount
    }

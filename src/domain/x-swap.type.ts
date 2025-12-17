import { ProtocolInfo } from "src/domain/defi-type.enum";
import { Token } from "./token.class";

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

import { ProtocolInfo, ProtocolType } from "src/domain/defi-type.enum";
import { Token } from "src/domain/token.class";

/**
 * OneHop 관계의 메타데이터
 */
export type OneHopMetadata = {
    protocol: ProtocolInfo;

    // 비용 관련
    fee: number;  // 0.003 = 0.3%
    estimatedGas?: bigint;

    // SWAP 전용 (optional)
    poolAddress?: string;
    estimatedSlippage?: number;

    // BRIDGE 전용 (optional)
    estimatedTimeSeconds?: number;
    minAmount?: bigint;
    maxAmount?: bigint;

    // 공통
    lastUpdated: number;  // timestamp
}

/**
 * 라우팅 경로의 한 단계
 */
export type RouteStep = {
    srcToken: Token;
    dstToken: Token;
    metadata: OneHopMetadata;
}

/**
 * 전체 경로
 */
export type Route = {
    steps: RouteStep[];
    totalFee: number;
    totalEstimatedTime: number;
}

// ============================================
// Repository 인터페이스
// ============================================

export interface ITokenRepository {
    save(token: Token): Promise<void>;
    findById(chainId: number, address: string): Promise<Token | null>;
    findByChain(chainId: number): Promise<Token[]>;
}

export interface IProtocolRepository {
    save(protocol: ProtocolInfo): Promise<void>;
    findByName(name: string): Promise<ProtocolInfo | null>;
    findAll(): Promise<ProtocolInfo[]>;
}

/**
 * OneHop = SWAP 또는 BRIDGE 관계
 * - SWAP: srcToken.chainId === dstToken.chainId
 * - BRIDGE: srcToken.chainId !== dstToken.chainId
 */
export interface IOneHopRepository {
    // ✅ 개선: srcChainId, dstChainId 제거 (Token에서 가져옴)
    // ✅ 개선: metadata 추가
    save(srcToken: Token, dstToken: Token, metadata: OneHopMetadata): Promise<void>;

    // ⭐ 조회 메서드 추가 - 라우팅에 필수!

    /**
     * 특정 토큰에서 직접 갈 수 있는 토큰들 조회
     */
    findDirectHops(srcToken: Token): Promise<RouteStep[]>;

    /**
     * 두 토큰 간의 직접 연결 조회
     */
    findDirectHop(srcToken: Token, dstToken: Token): Promise<RouteStep | null>;

    /**
     * 특정 프로토콜만 사용하는 직접 연결 조회
     */
    findDirectHopByProtocol(srcToken: Token, dstToken: Token, protocolName: string): Promise<RouteStep | null>;
}

/**
 * 라우팅 서비스 (경로 탐색)
 */
export interface IRoutingService {
    /**
     * 최적 경로 찾기 (1-5홉)
     * @param srcToken 출발 토큰
     * @param dstToken 도착 토큰
     * @param maxHops 최대 홉 수 (기본 5)
     * @returns 가능한 경로들 (비용 순으로 정렬)
     */
    findOptimalRoutes(srcToken: Token, dstToken: Token, maxHops?: number): Promise<Route[]>;

    /**
     * 최소 비용 경로
     */
    findCheapestRoute(srcToken: Token, dstToken: Token): Promise<Route | null>;

    /**
     * 최소 시간 경로 (브릿지 시간 고려)
     */
    findFastestRoute(srcToken: Token, dstToken: Token): Promise<Route | null>;
}

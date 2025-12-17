// 프로퍼티 타입 정의
export interface ChainNodeProperties {
    chainId: number;
    name: string;
    testnet: boolean;
}

export interface TokenNodeProperties {
    tokenId: string;
    address: string;
    symbol: string;
    chainId: number;
    decimals: number;
    name: string;
    isNative: boolean;
    logoUri: string | null;
}

export interface RelationshipProperties {
    protocol: string;
    protocolId: string;
    version: string;
}


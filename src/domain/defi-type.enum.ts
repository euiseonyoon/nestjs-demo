export enum ProtocolType {
    SWAP = "SWAP",
    BRIDGE = "BRIDGE",
}

export const getProtocolType = (relType: string): ProtocolType => {
    const validValues = Object.values(ProtocolType);

    if (validValues.includes(relType as ProtocolType)) {
        return relType as ProtocolType;
    }
    throw new Error(`Bad ProtocolType string given. given={${relType}}`);
};

export enum SwapProtocol {
    ONE_INCH = "ONE_INCH_SWAP",
    SUSHI_SWAP = "SUSHI_SWAP",
}

export const swapProtocolFromString = (swapProtocol: string): SwapProtocol => {
    const validValues = Object.values(SwapProtocol);

    if (validValues.includes(swapProtocol as SwapProtocol)) {
        return swapProtocol as SwapProtocol;
    }
    throw new Error(`Bad SwapProtocol string given. given={${swapProtocol}}`);
}

export enum BridgeProtocol {
    STARGATE = "STARGATE_BRIDGE",
}

export const bridgeProtocolFromString = (bridgeProtocol: string): BridgeProtocol => {
    const validValues = Object.values(BridgeProtocol);

    if (validValues.includes(bridgeProtocol as BridgeProtocol)) {
        return bridgeProtocol as BridgeProtocol;
    }
    throw new Error(`Bad BridgeProtocol string given. given={${bridgeProtocol}}`);
}

export type ProtocolInfo =
    | {
        protocolType: ProtocolType.SWAP;
        protocolName: SwapProtocol;
        version: string;
      }
    | {
        protocolType: ProtocolType.BRIDGE;
        protocolName: BridgeProtocol;
        version: string;
      };

export const isSwapProtocol = (info: ProtocolInfo): info is ProtocolInfo & { type: ProtocolType.SWAP } => {
    return info.protocolType === ProtocolType.SWAP;
};

export const isBridgeProtocol = (info: ProtocolInfo): info is ProtocolInfo & { type: ProtocolType.BRIDGE } => {
    return info.protocolType === ProtocolType.BRIDGE;
};

/**
 * ProtocolInfo의 런타임 일관성을 검증합니다.
 * protocolType과 protocolName이 올바르게 매칭되는지 확인합니다.
 *
 * @throws Error protocolType과 protocolName이 불일치할 경우
 */
export const validateProtocolInfo = (info: ProtocolInfo): void => {
    if (info.protocolType === ProtocolType.SWAP) {
        // SWAP 타입인 경우, protocolName이 SwapProtocol enum에 속하는지 확인
        const validSwapProtocols = Object.values(SwapProtocol);
        if (!validSwapProtocols.includes(info.protocolName as SwapProtocol)) {
            throw new Error(
                `ProtocolInfo validation failed: protocolType is SWAP but protocolName "${info.protocolName}" is not a valid SwapProtocol. ` +
                `Valid values: ${validSwapProtocols.join(', ')}`
            );
        }
    } else if (info.protocolType === ProtocolType.BRIDGE) {
        // BRIDGE 타입인 경우, protocolName이 BridgeProtocol enum에 속하는지 확인
        const validBridgeProtocols = Object.values(BridgeProtocol);
        if (!validBridgeProtocols.includes(info.protocolName as BridgeProtocol)) {
            throw new Error(
                `ProtocolInfo validation failed: protocolType is BRIDGE but protocolName "${info.protocolName}" is not a valid BridgeProtocol. ` +
                `Valid values: ${validBridgeProtocols.join(', ')}`
            );
        }
    }
};


const oneInchClassicSwapProtocolInfo = {
    protocolName: SwapProtocol.ONE_INCH,
    protocolType: ProtocolType.SWAP,
    version: "V1",
} as ProtocolInfo

const sushiSwapSimpleProtocolInfo = {
    protocolName: SwapProtocol.SUSHI_SWAP,
    protocolType: ProtocolType.SWAP,
    version: "V1",
} as ProtocolInfo

const stargateBridgeProtocolInfo = {
    protocolName: BridgeProtocol.STARGATE,
    protocolType: ProtocolType.BRIDGE,
    version: "V2",
} as ProtocolInfo

export const possibleProtocolInfo = {
    oneInchClassicSwapProtocolInfo,
    sushiSwapSimpleProtocolInfo,
    stargateBridgeProtocolInfo
} as const
export enum ProtocolType {
    SWAP = "SWAP",
    BRIDGE = "BRIDGE",
}

export function protocolTypeFromString(typeString: string): ProtocolType | undefined {
    const validValues = Object.values(ProtocolType);

    if (validValues.includes(typeString as ProtocolType)) {
        return typeString as ProtocolType;
    }
    return undefined;
}

export type ProtocolInfo = {
    name: string,
    type: ProtocolType,
    version: string,
}

const oneInchClassicSwapProtocolInfo = {
    name: "OneInchClassicSwap",
    type: ProtocolType.SWAP,
    version: "V1",
} as ProtocolInfo

const sushiSwapSimpleProtocolInfo = {
    name: "SushiSwapSimple",
    type: ProtocolType.SWAP,
    version: "V1",
} as ProtocolInfo

const stargateBridgeProtocolInfo = {
    name: "StargateBridge",
    type: ProtocolType.BRIDGE,
    version: "V2",
} as ProtocolInfo

export const possibleProtocolInfo = {
    oneInchClassicSwapProtocolInfo,
    sushiSwapSimpleProtocolInfo,
    stargateBridgeProtocolInfo
} as const
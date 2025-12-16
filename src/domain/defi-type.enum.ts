export enum ProtocolType {
    SWAP = "SWAP",
    BRIDGE = "BRIDGE",
}

export type ProtocolInfo = {
    name: string,
    type: ProtocolType,
    version: string,
}

export enum SwapNameEnum {
    ONE_INCH_CLASSIC = "OneInchClassic",
    SUSHI_SWAP_SIMPLE = "SushiSwapSimple",
}

export enum BridgeNameEnum {
    STARGATE = "StargateBridge"
}

const OneInchClassicSwap = {
    name: "OneInchClassicSwap",
    type: ProtocolType.SWAP,
    version: "OneInchClassicSwap",
} as ProtocolInfo

const SushiSwapSimple = {
    name: "SushiSwapSimple",
    type: ProtocolType.SWAP,
    version: "SushiSwapSimple",
} as ProtocolInfo

const StargateBridge = {
    name: "StargateBridge",
    type: ProtocolType.BRIDGE,
    version: "V2",
} as ProtocolInfo


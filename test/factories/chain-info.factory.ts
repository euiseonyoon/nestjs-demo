import { ChainInfo } from "src/domain/chain-info.type";

export function createTestChainInfo(
    info?: {
        id?: number,
        name?: string,
        testnet?: boolean,
    }
): ChainInfo {
    return {
        id: info?.id ?? 1,
        name: info?.name ?? "Some Chain",
        testnet: info?.testnet ?? false,
    }
}

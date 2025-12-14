import { ChainInfo } from "src/domain/chain-info.type";
import { Token } from "src/domain/token.class";
import { createTestChainInfo } from "./chain-info.factory";
import { createTestEvmAddress } from "./evm-address.factory";
import { EvmAddress } from "src/domain/evm-address.class";

export function createTestToken(
    info? : {
        chain?: ChainInfo,
        address?: EvmAddress,
        symbol?: string,
        decimals?: number,
        name?: string,
        logoUri?: string,
        isNativeToken?: boolean
    }
): Token {
    return new Token(
        info?.chain ?? createTestChainInfo(),
        info?.address ?? createTestEvmAddress(),
        info?.symbol ?? "TEST",
        info?.decimals ?? 18,
        info?.name ?? "Test Token",
        info?.logoUri ?? null,
        info?.isNativeToken ?? false,
    )
}

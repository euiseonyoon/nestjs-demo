import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { SupportedTokens } from "src/domain/supported.token";
import { Token } from "src/domain/token.class";

export abstract class AbstractDefiProtocolInfoProvider {
    abstract getSupportingChains(): Promise<ChainInfo[]>
    abstract getSupportingTokens(): Promise<Token[]>
    abstract getSupportingChainInfo(chainId: number): Promise<ChainInfo | null>
    abstract getSupportingToken(chainId: number, tokenAddress: EvmAddress): Promise<Token | null>

    async getSupprtedTokens(srcChainId: number, dstChainId: number, srcTokenAddr: EvmAddress, dstTokenAddr: EvmAddress): Promise<SupportedTokens | null>{
        const [srcChain, dstChain, srcToken, dstToken] = await Promise.all([
            this.getSupportingChainInfo(srcChainId),
            this.getSupportingChainInfo(dstChainId),
            this.getSupportingToken(srcChainId, srcTokenAddr),
            this.getSupportingToken(dstChainId, dstTokenAddr)
        ])

        if(!srcChain || !dstChain || !srcToken || !dstToken) {
            return null
        }
        
        return {
            srcToken: srcToken,
            dstToken: dstToken
        };
    }
}

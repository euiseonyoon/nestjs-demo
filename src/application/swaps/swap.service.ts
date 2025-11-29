import { ChainInfo } from 'src/common/chain-info.type';
import { Token } from 'src/common/token.type';

export abstract class SwapService {
    private supportingChains: ChainInfo[];
    private supportingTokens: Token[];

    constructor(supportingChains: ChainInfo[], supportingTokens: Token[]) {
        this.supportingChains = supportingChains;
        this.supportingTokens = supportingTokens;
    }

    getSupportingChain(): ChainInfo[] {
        return this.supportingChains;
    }

    getSupportingTokens(): Token[] {
        return this.supportingTokens
    }

    getChainInfo(chainId: number): ChainInfo | undefined {
        return this.getSupportingChain().find(
            (chain) => chain.id === chainId,
        );
    }

    getTokenInfo(token: Token): Token | undefined {
        return this.getSupportingTokens().find(
            (supportingToken) => supportingToken.address === token.address && supportingToken.chain.id === token.chain.id,
        );
    }

    protected setSupportingTokens(tokens: Token[]): void {
        this.supportingTokens = tokens;
    }
}

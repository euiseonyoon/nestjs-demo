import { Inject, Injectable } from "@nestjs/common";
import { STARGATE_INFO_FETCHER } from "src/module/module.token";
import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";
import { StargateChainDetail } from "./stargate-api.response";
import { Cron } from "@nestjs/schedule";
import { AbstractStargateInfoProvider } from "src/application/bridges/stargate/required_port/stargate.info-provider.interface";
import type { IStargateInfoFetcher } from "src/application/info-fetcher/bridge/stargate/provided_port/stargate.info-fetcher.interface";

@Injectable()
export class StargateInfoProvider extends AbstractStargateInfoProvider {
    // value: chainKey(e.g. 'ethereum')
    private chainIdChainKeyMap = new Map<number, string>()
    // key: chainKey(e.g. 'ethereum')
    private chainKeyChainIdMap = new Map<string, number>()

    private supportingChains: ChainInfo[] = []
    private supportingTokens: Token[] = []

    // key: chainKey(e.g. 'ethereum')
    private tokenCache = new Map<string, Token>()
    
    constructor(
        @Inject(STARGATE_INFO_FETCHER)
        private readonly infoFetcher: IStargateInfoFetcher,
    ) {
        super()
        this.refreshInfos()
    }

    convertChainIdToChainKey(chainId: number): string | null {
        return this.chainIdChainKeyMap.get(chainId) ?? null;
    }

    // 매일 새벽 3시에 한번씩 초기화
    @Cron('0 0 3 * * *')
    async refreshInfos() {
        const chainList = await this.infoFetcher.fetchSupportingChains()
        chainList?.chains.forEach((chainDetail)=> {
            if (chainDetail.chainType === 'evm') {
                this.setChainKeyMaps(chainDetail)
                this.setSupportingChain(chainDetail)
            }
        });
        this.setSupportingTokens()
    }

    private setChainKeyMaps(chainDetail: StargateChainDetail) {
        if (!chainDetail) return 

        const chainId = chainDetail.chainId
        const chainKey = chainDetail.chainKey

        this.chainIdChainKeyMap.set(chainId, chainKey)
        this.chainKeyChainIdMap.set(chainKey, chainId)
    }

    private setSupportingChain(chainDetail: StargateChainDetail) {
        const chain = {
            id: chainDetail.chainId,
            name: chainDetail.name,
            testnet: false
        }
        this.supportingChains.push(chain)
    }

    private async setSupportingTokens(): Promise<void> {
        const response = await this.infoFetcher.fetchSupportingTokens();
        if (!response) return;

        const tokens = await Promise.all(
            response.tokens
                .filter(t => t.isBridgeable)
                .map(async (token) => {
                    const chainId = this.chainKeyChainIdMap.get(token.chainKey);
                    const chainInfo = chainId ? await this.getSupportingChainInfo(chainId) : null;

                    return chainInfo ? {
                        token: new Token(
                            chainInfo,
                            new EvmAddress(token.address),
                            token.symbol,
                            token.decimals,
                            token.name,
                            null,
                            Token.isNativeToken(token.address)
                        ),
                        chainKey: token.chainKey
                    } : null;
                })
        );

        tokens.forEach(item => {
            if (item) {
                this.supportingTokens.push(item.token);
                this.tokenCache.set(item.chainKey, item.token);
            }
        });
    }
    
    async getSupportingChains(): Promise<ChainInfo[]> {
        return this.supportingChains;
    }

    async getSupportingTokens(): Promise<Token[]> {
        return this.supportingTokens;
    }

    async getSupportingChainInfo(chainId: number): Promise<ChainInfo | null> {
        const result = this.supportingChains.find((chain) => 
            chain.id === chainId
        )
        if (!result) return null
        return result
    }

    async getSupportingToken(chainId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        const chainKey = this.chainIdChainKeyMap.get(chainId)
        if (!chainKey) return null

        return this.tokenCache.get(chainKey) ?? null
    }
}

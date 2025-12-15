import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Token } from 'src/domain/token.class';
import { Cron } from '@nestjs/schedule';
import { EvmAddress } from 'src/domain/evm-address.class';
import { HTTP_CLIENT, ONE_INCH_INFO_FETCHER } from 'src/module/module.token';
import { AbstractDefiProtocolInfoProvider } from '../../provided_port/defi-info-provider.interface';
import { ChainInfo } from 'src/domain/chain-info.type';
import { type IHttpClient } from '../../../common/required_port/http-client.interface';
import { type IOneInchInfoFetcher } from 'src/application/defi.info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface';

@Injectable()
export class OneInchInfoProvider extends AbstractDefiProtocolInfoProvider implements OnModuleInit{
    private tokenCache = new Map<string, Token>()

    private supportingChains: ChainInfo[]
    private supportingTokens: Token[] = []

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(ONE_INCH_INFO_FETCHER)
        private readonly oneInchInfoFetcher: IOneInchInfoFetcher,
    ) {
        super()
    }

    async onModuleInit(): Promise<void> {
        const supporintChains = await this.oneInchInfoFetcher.fetSupporingChains()
        if (supporintChains) {
            this.supportingChains = supporintChains
        }
        await this.setSupportingTokens()
        this.setChainIdTokenMap()
    }
    
    private async setChainIdTokenMap() {
        this.supportingTokens.map((token) => {
            const key = this.makeTokenCacheKey(token.chain.id, token.address)
            this.tokenCache.set(key, token)
        })
    }

    private makeTokenCacheKey(chainId: number, tokenAddress: EvmAddress): string {
        return `${chainId}-${tokenAddress.address}`
    }

    // 매일 새벽 3시에 한번씩 초기화
    @Cron('0 0 3 * * *')
    private async setSupportingTokens(): Promise<void> {
        try {
            const promises = this.supportingChains.map((chainInfo) => 
                this.fetchSupportingToken(chainInfo)
            );
            this.supportingTokens =  (await Promise.all(promises)).filter((value) => value !== null).flat()
        } catch (error) {
            throw error; 
        }
    }

    private async fetchSupportingToken(chainInfo: ChainInfo): Promise<Token[] | null> {
        const result = await this.oneInchInfoFetcher.fetchSupportingTokenByChainId(chainInfo)
        if (!result) return null

        return Object.values(result.tokens).map((tokenData) => {
            return Token.fromOneInchTokenData(tokenData, chainInfo);
        })
    }

    async getSupportingChains(): Promise<ChainInfo[]> {
        return this.supportingChains
    }

    async getSupportingTokens(): Promise<Token[]> {
        return this.supportingTokens
    }

    async getSupportingChainInfo(chainId: number): Promise<ChainInfo | null> {
        const result = this.supportingChains.find((chain) =>{
            chain.id === chainId
        })
        return result ?? null
    }

    async getSupportingToken(chinId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        const key = this.makeTokenCacheKey(chinId, tokenAddress)
        return this.tokenCache.get(key) ?? null
    }

}

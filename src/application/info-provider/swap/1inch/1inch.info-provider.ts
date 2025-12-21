import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Token } from 'src/domain/token.class';
import { Cron } from '@nestjs/schedule';
import { EvmAddress } from 'src/domain/evm-address.class';
import { 
    CACHE_REGISTRY, 
    ONE_INCH_INFO_FETCHER, 
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME,
    ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME,
    ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
} from 'src/module/module.token';
import { AbstractDefiProtocolInfoProvider } from '../../provided_port/defi-info-provider.interface';
import { ChainInfo } from 'src/domain/chain-info.type';
import { type IOneInchInfoFetcher } from 'src/application/info-fetcher/swap/1inch/provided_port/1inch-swap.info-fetcher.interface';
import { type ICacheKeyGenerator } from 'src/application/cache/key.generator/provided_port/cache.key.generator';
import { type ICacheRegistry } from 'src/application/cache/registry/provided_port/cache.registry.interface';
import { AbstractCacheInstance } from 'src/application/cache/cache.instance/provided_port/cache.instance.interface';
import { ChainCacheKeyInput } from 'src/application/cache/key.generator/chain.cache.input';

@Injectable()
export class OneInchInfoProvider extends AbstractDefiProtocolInfoProvider implements OnModuleInit{
    private tokenCache : AbstractCacheInstance<string, Token> | null
    private chainCache : AbstractCacheInstance<string, ChainInfo> | null

    private supportingChains: ChainInfo[]
    private supportingTokens: Token[] = []

    constructor(
        @Inject(CACHE_REGISTRY)
        cacheRegistry: ICacheRegistry,
        @Inject(ONE_INCH_INFO_FETCHER)
        private readonly oneInchInfoFetcher: IOneInchInfoFetcher,
        @Inject(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR)
        private readonly tokenCacheKeyGenerator: ICacheKeyGenerator<string, ChainCacheKeyInput>,
        @Inject(ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR)
        private readonly chainCacheKeyGenerator: ICacheKeyGenerator<string, number>,
    ) {
        super()
        this.tokenCache = cacheRegistry.getCacheInstance<string, Token>(ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME)
        this.chainCache = cacheRegistry.getCacheInstance<string, ChainInfo>(ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME)
    }

    async onModuleInit(): Promise<void> {
        await this.setSupportingChains()
        await this.setSupportingTokens()
        await this.addToTokenCache()
        await this.addToChainCache()
    }

    // 매일 새벽 2시에 한번씩 초기화
    @Cron('0 0 2 * * *')
    private async setSupportingChains(): Promise<void> {
        const supporintChains = await this.oneInchInfoFetcher.fetSupporingChains()
        if (supporintChains) {
            this.supportingChains = supporintChains
        }
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

    private async addToChainCache() {
        this.supportingChains.forEach((chainInfo) => {
            const key = this.chainCacheKeyGenerator.genKey(chainInfo.id)
            this.chainCache?.save(key, chainInfo)
        })
    }
    
    private async addToTokenCache() {
        this.supportingTokens.map((token) => {
            const key = this.tokenCacheKeyGenerator.genKey(
                { chainId: token.chain.id, tokenAddress:  token.address}
            )
            this.tokenCache?.save(key, token)
        })
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
        return this.getSupportingChainInfoFromCache(chainId) ?? this.getSupporingChainInfoFromArray(chainId)
    }

    private async getSupportingChainInfoFromCache(chainId: number): Promise<ChainInfo | null> {
        const key = this.chainCacheKeyGenerator.genKey(chainId)
        return this.chainCache?.get(key) ?? null
    }

    private async getSupporingChainInfoFromArray(chainId: number) : Promise<ChainInfo | null> {
        return this.supportingChains.find((chain) =>{
            chain.id === chainId
        }) ?? null
    }

    async getSupportingToken(chainId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        return this.getSupportingTokenFromCache(chainId, tokenAddress) ?? 
            this.getSupportingTokenFromArray(chainId, tokenAddress)
    }

    private async getSupportingTokenFromCache(chainId: number, tokenAddress: EvmAddress):  Promise<Token | null> {
        const key = this.tokenCacheKeyGenerator.genKey(
            { chainId: chainId, tokenAddress: tokenAddress}
        )
        return this.tokenCache?.get(key) ?? null
    }

    private async getSupportingTokenFromArray(chainId: number, tokenAddress: EvmAddress):  Promise<Token | null> {
        return this.supportingTokens.find((token) => {
            return (token.chain.id === chainId) && (token.address.equals(tokenAddress))
        }) ?? null
    }
}

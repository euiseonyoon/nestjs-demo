import { Inject, Injectable, OnModuleInit } from "@nestjs/common"
import { AbstractDefiProtocolInfoProvider } from "../../provided_port/defi-info-provider.interface"
import { Token } from "src/domain/token.class"
import { 
    CACHE_REGISTRY, 
    SUSHI_SWAP_INFO_FETCHER,
    SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR,
    SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_NAME,
    SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR,
    SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_NAME,
 } from "src/module/module.token"
import { ChainInfo } from "src/domain/chain-info.type"
import { EvmAddress } from "src/domain/evm-address.class"
import type { ISushiSwapInfoFetcher } from "src/application/info-fetcher/swap/sushi-swap/provided_port/sushi-swap.info-fetcher.interface"
import { Cron } from "@nestjs/schedule"
import { AbstractCacheInstance } from "src/application/cache/cache.instance/provided_port/cache.instance.interface"
import type { ICacheRegistry } from "src/application/cache/registry/provided_port/cache.registry.interface"
import type { ICacheKeyGenerator } from "src/application/cache/key.generator/provided_port/cache.key.generator"
import { ChainCacheKeyInput } from "src/application/cache/key.generator/chain.cache.input"

@Injectable()
export class SushiSwapInfoProvider extends AbstractDefiProtocolInfoProvider implements OnModuleInit{
    private tokenCache : AbstractCacheInstance<string, Token> | null
    private chainCache : AbstractCacheInstance<string, ChainInfo> | null

    private supportingChains : ChainInfo[]
    private supportingTokens: Record<string, Token> = {}

    constructor(
        @Inject(CACHE_REGISTRY)
        cacheRegistry: ICacheRegistry,
        @Inject(SUSHI_SWAP_INFO_FETCHER)
        private readonly sushiSwapInfoFetcher: ISushiSwapInfoFetcher,
        @Inject(SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR)
        private readonly tokenCacheKeyGenerator: ICacheKeyGenerator<string, ChainCacheKeyInput>,
        @Inject(SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR)
        private readonly chainCacheKeyGenerator: ICacheKeyGenerator<string, number>,
    ) {
        super()
        this.tokenCache = cacheRegistry.getCacheInstance<string, Token>(SUSHI_SWAP_INFO_PROVIDER_TOKEN_CACHE_NAME)
        this.chainCache = cacheRegistry.getCacheInstance<string, ChainInfo>(SUSHI_SWAP_INFO_PROVIDER_CHAIN_CACHE_NAME)
    }

    async onModuleInit() {
        await this.setSupportingChains();
        await this.addToChainCache();
    }

    @Cron('0 0 2 * * *')
    private async setSupportingChains(): Promise<void> {
        const supporintChains = await this.sushiSwapInfoFetcher.getSupportingChains()
        if (supporintChains) {
            this.supportingChains = supporintChains
        }
    }
    private async addToChainCache() {
        this.supportingChains.forEach((chainInfo) => {
            const key = this.chainCacheKeyGenerator.genKey(chainInfo.id)
            this.chainCache?.save(key, chainInfo, null)
        })
    }

    async getSupportingChains(): Promise<ChainInfo[]> {
        return this.supportingChains
    }

    async getSupportingTokens(): Promise<Token[]> {
        return Object.values(this.supportingTokens)
    }

    async getSupportingChainInfo(chainId: number): Promise<ChainInfo | null> {
        const key = this.chainCacheKeyGenerator.genKey(chainId)
        const fromCache = await this.chainCache?.get(key) ?? null

        if(fromCache) return fromCache

        return this.supportingChains.find((chainInfo) => chainInfo.id === chainId) ?? null
    }

    private async checkTokenSupportedBySushiSwap(chain: ChainInfo, tokenAddress: EvmAddress): Promise<boolean> {
        const supportingTokenAddresses = await this.sushiSwapInfoFetcher.fetchSupportingTokenAddresses(chain.id)
        if(!supportingTokenAddresses) return false

        const entry = Object.entries(supportingTokenAddresses).find(
            ([address, _price]) => tokenAddress.equals(address)
        ) ?? null;
        if(!entry) return false

        return true
    }

    private async getTokenFromCache(chainId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        const key = this.tokenCacheKeyGenerator.genKey({chainId, tokenAddress})

        // from tokenCache
        const fromCache = await this.tokenCache?.get(key) ?? null
        if (fromCache) return fromCache

        // from supportingTokens
        return this.supportingTokens[key] ?? null
    }

    private async saveTokenToCache(token: Token): Promise<void> {
        const key = this.tokenCacheKeyGenerator.genKey({
            chainId: token.chain.id, 
            tokenAddress: token.address
        })

        await this.tokenCache?.save(key, token, null)
        this.supportingTokens[key] = token
    }

    async getSupportingToken(chainId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        // search cache
        const tokenFromCache = await this.getTokenFromCache(chainId, tokenAddress)
        if (tokenFromCache) return tokenFromCache

        const targetChain = await this.getSupportingChainInfo(chainId)
        if (!targetChain) return null

        const supported = await this.checkTokenSupportedBySushiSwap(targetChain, tokenAddress)
        if(!supported) return null

        const token = await this.sushiSwapInfoFetcher.getToken(targetChain, tokenAddress)
        if(!token) return null

        // save to cache
        await this.saveTokenToCache(token)

        return token
    }
}

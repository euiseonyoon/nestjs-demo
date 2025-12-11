import { Inject, Injectable } from "@nestjs/common"
import { AbstractDefiProtocolInfoProvider } from "../../provided_port/defi-info-provider.interface"
import { SUSHI_SUPPORTING_CHAINS } from "./constant.supporting-chain"
import { Token } from "src/domain/token.class"
import { HTTP_CLIENT } from "src/module/http-client.module"
import { type IHttpClient } from "src/application/common/required_port/http-client.interface"
import { ChainInfo } from "src/domain/chain-info.type"
import { EvmAddress } from "src/domain/evm-address.class"
import { PriceResponse } from "./sushi-swap.response"
import { RPC_CLIENT_MANAGER } from "src/infrastructure/manager/rpc-client-manager.token"
import { type IRpcClientManager } from "src/application/transaction/required_port/tx.required-port"
import { Address, erc20Abi } from 'viem';

@Injectable()
export class SushiSwapInfoProvider extends AbstractDefiProtocolInfoProvider{
    // TODO: sushi swap sdk에서 SWAP_API_SUPPORTED_CHAIN_IDS를 활용할수 있을것 같다.
    private supportingChains = SUSHI_SUPPORTING_CHAINS
    private supportingTokens: Record<string, Token> = {}

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(RPC_CLIENT_MANAGER)
        private readonly prcClientManager: IRpcClientManager
    ) {
        super()
    }

    async getSupportingChains(): Promise<ChainInfo[]> {
        return this.supportingChains
    }

    async getSupportingTokens(): Promise<Token[]> {
        return Object.values(this.supportingTokens)
    }

    async getSupportingChainInfo(chainId: number): Promise<ChainInfo | null> {
        return this.supportingChains.find((chain) => chain.id === chainId) ?? null
    }

    private async checkTokenSupportedBySushiSwap(chain: ChainInfo, tokenAddress: EvmAddress): Promise<boolean> {
        const supportingTokens = await this.fetchSupportingTokens(chain.id)
        if(!supportingTokens) return false

        const entry = Object.entries(supportingTokens).find(
            ([key, _value]) => key.toLowerCase() === tokenAddress.getAddress().toLowerCase()
        ) ?? null;
        if(!entry) return false

        return true
    }

    private async getTokenDetailFromContract(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null> {
        const client = this.prcClientManager.getRpcClient(chainInfo.id)
        if(!client) return null

        const viemTokenAddress = tokenAddress.getAddress() as Address
        const [decimals, name, symbol] = await Promise.all([
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'decimals'
            }),
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'name'
            }),
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'symbol'
            })
        ]);

        return new Token(
            chainInfo,
            tokenAddress,
            symbol,
            decimals,
            name,
            null
        )
    }

    private async saveToken(key: string, token: Token) {
        this.supportingTokens[key] = token
    }

    async getSupportingToken(chainId: number, tokenAddress: EvmAddress): Promise<Token | null> {
        const key = this.makeTokenCacheKey(chainId, tokenAddress)
        const tokenFromCache = this.supportingTokens[key] ?? null
        if (tokenFromCache) return tokenFromCache

        const targetChain = await this.getSupportingChainInfo(chainId)
        if (!targetChain) return null

        const supported = await this.checkTokenSupportedBySushiSwap(targetChain, tokenAddress)
        if(!supported) return null

        const token = await this.getTokenDetailFromContract(targetChain, tokenAddress)
        if(!token) return null

        this.saveToken(key, token)
        return token
    }

    private async fetchSupportingTokens(chainId: number): Promise<PriceResponse | null> {
        // TODO: 결과내용이 정상이면 cache하자
    
        const url = `https://api.sushi.com/price/v1/${chainId}`
        const response = await this.httpClient.get<PriceResponse>(url)
        if (!response || response.isError) return null
        
        return response.data
    }

    private makeTokenCacheKey(chainId: number, tokenAddress: EvmAddress): string {
        return `${chainId}-${tokenAddress.getAddress().toLowerCase}`
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChainId } from 'src/domain/chain-id.enum';
import { Token } from 'src/domain/token.class';
import { Cron } from '@nestjs/schedule';
import { EvmAddress } from 'src/domain/evm-address.class';
import { HTTP_CLIENT } from 'src/module/http-client.module';
import { AbstractDefiProtocolInfoProvider } from '../../provided_port/defi-info-provider.interface';
import { ChainInfo } from 'src/domain/chain-info.type';
import { type IHttpClient } from '../../../common/required_port/http-client.interface';
import { OneInchTokensResponse } from './1inch-api.response';

@Injectable()
export class OneInchInfoProvider extends AbstractDefiProtocolInfoProvider{
    readonly oneInchBaseUrl = 'https://api.1inch.com/swap/v6.1'
    private apiKey: string | undefined
    private tokenCache = new Map<string, Token>()

    private supportingChains = [
            {id: ChainId.EthereumMain, name: "Ethereum Main", testnet: false},
            {id: ChainId.ArbitrumMain, name: "Arbitrum Main", testnet: false},
            {id: ChainId.AvalancheMain, name: "Avalanche Main", testnet: false},
            {id: ChainId.BaseMain, name: "Base Main", testnet: false},
            {id: ChainId.BnBMain, name: "BnB Main", testnet: false},
            {id: ChainId.ZkSyncMain, name: "ZkSync Main", testnet: false},
            {id: ChainId.GnosisMain, name: "Gnosis Main", testnet: false},
            {id: ChainId.OptimismMain, name: "Optimism Main", testnet: false},
            {id: ChainId.PolygonMain, name: "Polygon Main", testnet: false},
            {id: ChainId.LineaMain, name: "Linea Main", testnet: false},
            {id: ChainId.SonicMain, name: "Sonic Main", testnet: false},
            {id: ChainId.UnichainMain, name: "Unichain Main", testnet: false},
        ]
    private supportingTokens: Token[] = []

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        private readonly configService: ConfigService,
    ) {
        super()
    }

    async onModuleInit(): Promise<void> {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
        this.setSupportingTokens()
        this.setChainIdTokenMap()
    }
    
    private async setChainIdTokenMap() {
        this.supportingTokens.map((token) => {
            const key = this.makeTokenCacheKey(token.chain.id, token.address)
            this.tokenCache.set(key, token)
        })
    }

    private makeTokenCacheKey(chainId: number, tokenAddress: EvmAddress): string {
        return `${chainId}-${tokenAddress.getAddress().toLowerCase}`
    }

    // 매일 새벽 3시에 한번씩 초기화
    @Cron('0 0 3 * * *')
    private async setSupportingTokens(): Promise<void> {
        try {
            this.supportingTokens = await this.fetchSupportingTokens();
        } catch (error) {
            throw error; 
        }
    }

    private async fetchSupportingTokens(): Promise<Token[]> {
        const supportingChains = await this.getSupportingChains();
        const promises = supportingChains.map((chainInfo) => {
            return this.fetchSupportingTokenByChainId(chainInfo.id);
        });
        const tokensByChain = await Promise.all(promises);
        return tokensByChain.flat();
    }

    private async fetchSupportingTokenByChainId(chainId: number): Promise<Token[]> {
        const response = await this.httpClient.get<OneInchTokensResponse>(
            `https://api.1inch.com/swap/v6.1/${chainId}/tokens`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            }
        );
        if (!response || response.isError) return []

        const chainInfo = await this.getSupportingChainInfo(chainId)
        if (!chainInfo) return []
        
        return Object.values(response.data.tokens).map(
            (tokenData) => Token.fromOneInchTokenData(tokenData, chainInfo),
        );
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

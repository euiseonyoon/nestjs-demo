import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { IOneInchInfoFetcher } from "./provided_port/1inch-swap.info-fetcher.interface";
import { HTTP_CLIENT } from "src/module/module.token";
import { type IHttpClient } from "src/application/common/required_port/http-client.interface";
import { ConfigService } from "@nestjs/config";
import { ClassicSwapQuoteResponse, OneInchChainAndTokens, OneInchHistoryResponseDto, OneInchTokensResponse } from "./1inch-swap.info-fetcher.response";
import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { ChainId } from "src/domain/chain-id.enum";
import { ChainInfo } from "src/domain/chain-info.type";

@Injectable()
export class OneInchInfoFetcher implements IOneInchInfoFetcher, OnModuleInit{
    readonly oneInchBaseUrl = 'https://api.1inch.com'
    private apiKey: string | undefined

    private supportingChains = [
        {id: ChainId.EthereumMain, name: "Ethereum Main", testnet: false} as ChainInfo,
        {id: ChainId.ArbitrumMain, name: "Arbitrum Main", testnet: false} as ChainInfo,
        {id: ChainId.AvalancheMain, name: "Avalanche Main", testnet: false} as ChainInfo,
        {id: ChainId.BaseMain, name: "Base Main", testnet: false} as ChainInfo,
        {id: ChainId.BnBMain, name: "BnB Main", testnet: false} as ChainInfo,
        {id: ChainId.ZkSyncMain, name: "ZkSync Main", testnet: false} as ChainInfo,
        {id: ChainId.GnosisMain, name: "Gnosis Main", testnet: false} as ChainInfo,
        {id: ChainId.OptimismMain, name: "Optimism Main", testnet: false} as ChainInfo,
        {id: ChainId.PolygonMain, name: "Polygon Main", testnet: false} as ChainInfo,
        {id: ChainId.LineaMain, name: "Linea Main", testnet: false} as ChainInfo,
        {id: ChainId.SonicMain, name: "Sonic Main", testnet: false} as ChainInfo,
        {id: ChainId.UnichainMain, name: "Unichain Main", testnet: false} as ChainInfo,
    ]

    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit(): Promise<void> {
        this.apiKey = this.configService.get<string>('ONE_INCH_API_KEY');
    }

    async fetSupporingChains(): Promise<ChainInfo[] | null> {
        return this.supportingChains
    }

    async fetchSwapOutAmount(address: EvmAddress, chainId: number): Promise<OneInchHistoryResponseDto | null> {
        const currentTimestampMs: number = Date.now();
        const response = await this.httpClient.get<OneInchHistoryResponseDto>(
            `${this.oneInchBaseUrl}/history/v2.0/history/${address}/events`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                params : {
                    limit: 10,
                    chainId: chainId,
                    fromTimestampMs: currentTimestampMs - 1000*60*10, // 10분전 부터
                    toTimestampMs: currentTimestampMs + 1000*60*5// 지금까지
                }
            },
        );
        if (response.isErrorResponse || response.isNetworkError) return null
        return response.data
    }

    async fetchSupportingTokenByChainId(chainInfo: ChainInfo): Promise<OneInchTokensResponse | null> {
        const response = await this.httpClient.get<OneInchTokensResponse>(
            `https://api.1inch.com/swap/v6.1/${chainInfo.id}/tokens`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            }
        );
        if (response.isErrorResponse || response.isNetworkError) return null

        return response.data
    }


    async getClassicSwapQuote(srcToken: Token, dstToken: Token, amount: string): Promise<bigint | null> {
        const response = await this.httpClient.get<ClassicSwapQuoteResponse>(
            `${this.oneInchBaseUrl}/swap/v6.1/${srcToken.chain.id}/quote`,
            {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                params : {
                    src: srcToken.address.getAddress(),
                    dst: dstToken.address.getAddress(),
                    amount: srcToken.convertToBigIntAmount(amount).toString(),
                    includeTokensInfo: true,
                    includeProtocols: true,
                    includeGas: true,
                }
            },
        );
        if (response.isErrorResponse || response.isNetworkError) return null
        return BigInt(response.data.dstAmount)
    }
}

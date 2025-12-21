import { Inject, Injectable } from "@nestjs/common";
import { ISushiSwapInfoFetcher } from "./provided_port/sushi-swap.info-fetcher.interface";
import { ChainInfo } from "src/domain/chain-info.type";
import { SUSHI_SUPPORTING_CHAINS } from "./constant.supporting-chain";
import { ERC20_INFO_FETCHER, HTTP_CLIENT } from "src/module/module.token";
import type { IHttpClient } from "src/application/common/required_port/http-client.interface";
import { PriceResponse } from "./sushi-swap.response";
import { EvmAddress } from "src/domain/evm-address.class";
import { Token } from "src/domain/token.class";
import type { IErc20InfoFetcher } from "../../erc20/provided_port/erc20.info-fetcher.interface";

@Injectable()
export class SushiSwapInfoFetcher implements ISushiSwapInfoFetcher {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
        @Inject(ERC20_INFO_FETCHER)
        private readonly erc20InfoFetcher: IErc20InfoFetcher,
    ) {}

    async getSupportingChains(): Promise<ChainInfo[]> {
        // TODO: sushi swap sdk의 SWAP_API_SUPPORTED_CHAIN_ID활용?
        return SUSHI_SUPPORTING_CHAINS
    }

    async fetchSupportingTokenAddresses(chainId: number): Promise<PriceResponse | null> {
        const url = `https://api.sushi.com/price/v1/${chainId}`
        const response = await this.httpClient.get<PriceResponse>(url)
        return response.data
    }
    
    async getToken(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null> {
        return await this.erc20InfoFetcher.getToken(chainInfo, tokenAddress)
    }
}
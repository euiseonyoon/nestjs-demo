import { Inject, Injectable } from "@nestjs/common";
import { IStargateInfoFetcher } from "./provided_port/stargate.info-fetcher.interface";
import { StargateChainResponse, StargateTokenReponse } from "src/application/info-provider/bridge/stargate/stargate-api.response";
import { HTTP_CLIENT } from "src/module/module.token";
import type { IHttpClient } from "src/application/common/required_port/http-client.interface";

@Injectable()
export class StargateInfoFetcher implements IStargateInfoFetcher {
    constructor(
        @Inject(HTTP_CLIENT)
        private readonly httpClient: IHttpClient,
    ) {}
    async fetchSupportingChains(): Promise<StargateChainResponse | null> {
        const response = await this.httpClient.get<StargateChainResponse>(
            "https://stargate.finance/api/v1/chains", 
        )
        return response.data;
    }
    
    async fetchSupportingTokens(): Promise<StargateTokenReponse | null> {
        const response = await this.httpClient.get<StargateTokenReponse>(
            "https://stargate.finance/api/v1/tokens", 
        )
        return response.data;
    }
}

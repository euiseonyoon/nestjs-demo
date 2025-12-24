import { StargateChainResponse, StargateTokenReponse } from "src/application/info-provider/bridge/stargate/stargate-api.response";

export interface IStargateInfoFetcher {
    fetchSupportingChains(): Promise<StargateChainResponse | null>

    fetchSupportingTokens(): Promise<StargateTokenReponse | null>
}

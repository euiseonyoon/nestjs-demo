import { IDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";

export interface IStargateInfoProvider extends IDefiProtocolInfoProvider {
    convertChainIdToChainKey(chainId: number): string | null
}

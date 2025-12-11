import { IDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";

export abstract class IStargateInfoProvider extends IDefiProtocolInfoProvider {
    abstract convertChainIdToChainKey(chainId: number): string | null
}

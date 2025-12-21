import { AbstractDefiProtocolInfoProvider } from "src/application/info-provider/provided_port/defi-info-provider.interface";

export abstract class AbstractStargateInfoProvider extends AbstractDefiProtocolInfoProvider {
    abstract convertChainIdToChainKey(chainId: number): string | null
}

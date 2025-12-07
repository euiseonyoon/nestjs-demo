export interface IStargateInfoProvider {
    convertChainIdToChainKey(chainId: number): string | null
}

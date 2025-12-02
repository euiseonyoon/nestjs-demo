import { PublicClient } from "viem";

export interface IRpcClientManager {
    getRpcClient(chainId: number): PublicClient | null;
}

import { PublicClient } from "viem";

export interface RpcClientManager {
    getRpcClient(chainId: number): PublicClient | null;
}

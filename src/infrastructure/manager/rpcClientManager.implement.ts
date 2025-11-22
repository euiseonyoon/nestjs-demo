import { Chain } from "viem";
import type { PublicClient } from "viem";
import { Inject, Injectable } from "@nestjs/common";
import type { ChainPublicClients } from "../rpcNodeProvider/chainPublicClients.iterface";

export interface RpcClientManager {
    getRpcClient(chain: Chain): PublicClient
}

@Injectable()
export class RpcClientManagerImpl implements RpcClientManager {

    constructor(
        @Inject('AllChainPublicClients')
        private readonly chainPublicClients: ChainPublicClients[],
    ) {}

    getRpcClient(chain: Chain): PublicClient {
        for (const provider of this.chainPublicClients) {
            const client = provider.clients.find(c => c.chain?.id === chain.id);
            if (client) return client;
        }
        throw new Error(`No client found for chain: ${chain.name} (id: ${chain.id})`);
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { Chain } from 'viem';
import type { PublicClient } from 'viem';
import type { ChainPublicClients } from '../rpc-node-provider/chain-public-clients.interface';

export interface RpcClientManager {
    getRpcClient(chain: Chain): PublicClient;
}

@Injectable()
export class RpcClientManagerImpl implements RpcClientManager {
    private readonly chainMap = new Map<
        number, // Chain ID를 Key로 사용
        { cursor: number; clients: PublicClient[] }
    >();

    constructor(
        @Inject('AllChainPublicClients')
        private readonly chainPublicClients: ChainPublicClients[],
    ) {
        this.initializeChainMap(chainPublicClients);
    }

    private initializeChainMap(allClients: ChainPublicClients[]): void {
        allClients.forEach((publicClientsGroup) => {
            const clients = publicClientsGroup.clients;
            if (clients.length === 0) {
                return;
            }

            // 모든 클라이언트가 동일한 체인에 속하는지 확인 (선택 사항이나 권장)
            const chainId = clients[0].chain.id;
            if (this.chainMap.has(chainId)) {
                throw new Error(
                    `Duplicate client group found for Chain ID: ${chainId}`,
                );
            }

            this.chainMap.set(chainId, { cursor: 0, clients: clients });
        });
    }

    findChainByRoundRobin(chain: Chain): PublicClient | undefined {
        const info = this.chainMap.get(chain.id);
        if (info == undefined) {
            return undefined;
        }

        const publicCient = info.clients[info.cursor];
        info.cursor = (info.cursor + 1) % info.clients.length;
        return publicCient;
    }

    getRpcClient(chain: Chain): PublicClient {
        const result = this.findChainByRoundRobin(chain);
        if (result == undefined) {
            throw new Error(
                `No client found for chain: ${chain.name} (id: ${chain.id})`,
            );
        }

        return result;
    }
}

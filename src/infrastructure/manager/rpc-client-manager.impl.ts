import { Inject, Injectable } from '@nestjs/common';
import { PublicClient } from 'viem';
import { ChainPublicClients } from '../rpc-node-provider/chain-public-clients.interface';
import { IRpcClientManager } from 'src/application/transaction/required_port/tx.required-port';
import { ALL_CHAIN_PUBLIC_CLIENTS } from '../infrastructure.token';

@Injectable()
export class RpcClientManager implements IRpcClientManager {
    private readonly chainMap = new Map<
        number, // Chain ID를 Key로 사용
        { cursor: number; clients: PublicClient[] }
    >();

    constructor(
        @Inject(ALL_CHAIN_PUBLIC_CLIENTS)
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

    findChainByRoundRobin(chainId: number): PublicClient | null {
        const info = this.chainMap.get(chainId);
        if (info == undefined) {
            return null;
        }

        const publicCient = info.clients[info.cursor];
        info.cursor = (info.cursor + 1) % info.clients.length;
        return publicCient;
    }

    getRpcClient(chainId: number): PublicClient | null{
        const result = this.findChainByRoundRobin(chainId);
        if (result == undefined) {
            return null
        }

        return result;
    }
}

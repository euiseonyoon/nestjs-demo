import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { RpcClientManager } from 'src/infrastructure/manager/rpc-client-manager.impl';
import { Hash, TransactionReceipt } from 'viem';
import * as chains from 'viem/chains';
import { TxService } from './provided_port/tx.interface';
import { EvmTxHash } from 'src/common/evm-tx-hash.class';
import { RPC_CLIENT_MANAGER } from 'src/module/public-client.module';

@Injectable()
export class TxServiceImpl implements TxService {
    constructor(
        @Inject(RPC_CLIENT_MANAGER)
        private readonly rpcClientManager: RpcClientManager,
    ) {}

    private getChainById(id: number): chains.Chain | undefined {
        return Object.values(chains).find((chain) => chain.id === id);
    }

    async getTxReceipt(
        txHash: EvmTxHash,
        chainId: number,
    ): Promise<TransactionReceipt | null> {
        const chain = this.getChainById(chainId);

        if (chain === undefined) {
            throw new BadRequestException('지원하지 않는 체인입니다.');
        }

        const client = this.rpcClientManager.getRpcClient(chain.id);
        if (!client) return null

        const receipt = await client.getTransactionReceipt({ hash: txHash.toViemHash()});

        return receipt;
    }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Hash, TransactionReceipt, TransactionReceiptNotFoundError } from 'viem';
import * as chains from 'viem/chains';
import { ITxService } from './provided_port/tx.provided-port';
import { EvmTxHash } from 'src/domain/evm-tx-hash.class';
import { RPC_CLIENT_MANAGER } from 'src/infrastructure/infrastructure.token';
import { type IRpcClientManager } from './required_port/tx.required-port';

@Injectable()
export class TxService implements ITxService {
    constructor(
        @Inject(RPC_CLIENT_MANAGER)
        private readonly rpcClientManager: IRpcClientManager,
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
        if (!client) return null;

        try {
            const receipt = await client.getTransactionReceipt({
                hash: txHash.toViemHash()
            });
            return receipt;
        } catch (error) {
            if (error instanceof TransactionReceiptNotFoundError) {
                return null;  // pending이거나 존재하지 않음
            }
            throw error;  // 다른 에러는 그대로 전파
        }
    }
}

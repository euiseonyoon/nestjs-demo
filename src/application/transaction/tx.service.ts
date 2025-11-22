import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { RpcClientManager } from 'src/infrastructure/manager/rpc-client-manager.impl';
import { Hash, TransactionReceipt } from 'viem';
import * as chains from 'viem/chains';
import { TxService } from './provided_port/tx.interface';

@Injectable()
export class TxServiceImpl implements TxService {
  constructor(
    @Inject('RpcClientManager')
    private readonly rpcClientManager: RpcClientManager,
  ) {}

  private getChainById(id: number): chains.Chain | undefined {
    return Object.values(chains).find((chain) => chain.id === id);
  }

  async getTxReceipt(
    txHash: Hash,
    chainId: number,
  ): Promise<TransactionReceipt> {
    const chain = this.getChainById(chainId);

    if (chain === undefined) {
      throw new BadRequestException('지원하지 않는 체인입니다.');
    }

    const client = this.rpcClientManager.getRpcClient(chain);
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    return receipt;
  }
}

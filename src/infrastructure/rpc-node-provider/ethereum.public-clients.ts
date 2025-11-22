import { Injectable } from '@nestjs/common';
import { mainnet } from 'viem/chains';
import { ChainPublicClient } from './chain-public-client.decorator';
import { RootPublicClients } from './root-clients.base';

@Injectable()
@ChainPublicClient()
export class EthereumChainPublicClientsImpl extends RootPublicClients {
  constructor() {
    const httpUrls = [
      { chain: mainnet, httpUrl: 'https://eth.llamarpc.com' },
      { chain: mainnet, httpUrl: 'https://ethereum-rpc.publicnode.com' },
    ];
    const wssUrls = [
      { chain: mainnet, wssUrl: 'wss://ethereum-rpc.publicnode.com' },
    ];
    super(httpUrls, wssUrls);
  }
}

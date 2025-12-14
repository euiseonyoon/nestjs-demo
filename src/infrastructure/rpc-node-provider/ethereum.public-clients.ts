import { Injectable } from '@nestjs/common';
import { mainnet } from 'viem/chains';
import { ChainPublicClient } from './chain-public-client.decorator';
import { RootPublicClients } from './root-clients.base';

@Injectable()
@ChainPublicClient()
export class EthereumChainPublicClientsImpl extends RootPublicClients {
    constructor() {
        const httpUrls = [
            { chain: mainnet, httpUrl: mainnet.rpcUrls.default.http[0] },
        ];
        const wssUrls = [];
        super(httpUrls, []);
    }
}

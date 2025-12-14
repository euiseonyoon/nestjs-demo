import { Injectable } from '@nestjs/common';
import { bsc } from 'viem/chains';
import { ChainPublicClient } from './chain-public-client.decorator';
import { RootPublicClients } from './root-clients.base';

@Injectable()
@ChainPublicClient()
export class BscChainPublicClientsImpl extends RootPublicClients {
    constructor() {
        const httpUrls = [
            { chain: bsc, httpUrl: bsc.rpcUrls.default.http[0] },
        ];
        super(httpUrls, []);
    }
}

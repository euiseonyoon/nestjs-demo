import { Injectable } from '@nestjs/common';
import { base } from 'viem/chains';
import { ChainPublicClient } from './chain-public-client.decorator';
import { RootPublicClients } from './root-clients.base';

@Injectable()
@ChainPublicClient()
export class BaseChainPublicClientsImpl extends RootPublicClients {
    constructor() {
        const httpUrls = [
            { chain: base, httpUrl: 'https://base.llamarpc.com' },
        ];
        const wssUrls = [
            { chain: base, wssUrl: 'wss://base-rpc.publicnode.com' },
        ];
        super(httpUrls, wssUrls);
    }
}

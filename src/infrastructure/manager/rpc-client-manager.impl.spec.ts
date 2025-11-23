import {
    Chain,
    PublicClient,
    HttpTransport,
    WebSocketTransport,
    createPublicClient,
    http,
    webSocket,
    Transport,
} from 'viem';
import { mainnet, polygon } from 'viem/chains';
import { ChainPublicClients } from '../rpc-node-provider/chain-public-clients.interface';
import { RpcClientManagerImpl } from './rpc-client-manager.impl';

describe('RpcClientManagerImplTest', () => {
    type TransportFactory = (url: string) => HttpTransport | WebSocketTransport;

    const makePublicClients = (
        chain: Chain,
        transportFactory: TransportFactory,
        urls: string[],
    ): PublicClient<Transport, Chain>[] => {
        return urls.map((url) => {
            return createPublicClient({
                chain: chain,
                transport: transportFactory(url),
            });
        });
    };

    const createMockChainPublicClients = (
        httpClients: PublicClient<Transport, Chain>[],
        wssClients: PublicClient<Transport, Chain>[],
    ): ChainPublicClients => ({
        clients: [...httpClients, ...wssClients],
        createHttpPublicClients: () =>
            httpClients as PublicClient<HttpTransport, Chain>[],
        createWssPublicClients: () =>
            wssClients as PublicClient<WebSocketTransport, Chain>[],
    });

    describe('findChainByRoundRobin', () => {
        it('2개 이상의 PublcClient가 있을때, 라운드 로빈으로 가져오는지 확인한다. (http 2개)', (doneCallback) => {
            // GIVEN
            const ethFirstHttpUrl = 'first eth http url';
            const ethSecondHttpUrl = 'second eth http url';

            const ethPublicClients = createMockChainPublicClients(
                makePublicClients(mainnet, http, [
                    ethFirstHttpUrl,
                    ethSecondHttpUrl,
                ]),
                [],
            );
            const manager = new RpcClientManagerImpl([ethPublicClients]);
            const targetChain = mainnet; // ethereum 메인넷

            // WHEN
            const firstPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(firstPublicClient).not.toBeUndefined();
            expect(firstPublicClient?.transport.type).toBe('http');
            expect(firstPublicClient?.transport.url).toBe(ethFirstHttpUrl);

            // WHEN
            const secondPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(secondPublicClient).not.toBeUndefined();
            expect(secondPublicClient?.transport.type).toBe('http');
            expect(secondPublicClient?.transport.url).toBe(ethSecondHttpUrl);

            // WHEN
            const thirdPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(thirdPublicClient).not.toBeUndefined();
            expect(thirdPublicClient?.transport.type).toBe('http');
            expect(thirdPublicClient?.transport.url).toBe(ethFirstHttpUrl);

            doneCallback();
        });

        it('2개 이상의 PublcClient가 있을때, 라운드 로빈으로 가져오는지 확인한다. (http1개 + websocket개)', (doneCallback) => {
            // GIVEN
            const polygonHttpUrl = `first polygon http url`;
            const polygonWebsocketUrl = 'first polygon wss url';
            const polygonPublicClients = createMockChainPublicClients(
                makePublicClients(polygon, http, [polygonHttpUrl]),
                makePublicClients(polygon, webSocket, [polygonWebsocketUrl]),
            );
            const manager = new RpcClientManagerImpl([polygonPublicClients]);
            const targetChain = polygon; // polygon 메인넷

            // WHEN
            const firstPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(firstPublicClient).not.toBeUndefined();
            expect(firstPublicClient?.transport.type).toBe('http');
            expect(firstPublicClient?.transport.url).toBe(polygonHttpUrl);

            // WHEN
            const secondPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(secondPublicClient).not.toBeUndefined();
            expect(secondPublicClient?.transport.type).toBe('webSocket');

            doneCallback();
        });

        it('0개일떄 undefined를 반환하는지 확인한다', (doneCallback) => {
            // GIVEN
            const ethPublicClients = createMockChainPublicClients([], []);
            const manager = new RpcClientManagerImpl([ethPublicClients]);
            const targetChain = mainnet; // ethereum 메인넷

            // WHEN
            const firstPublicClient =
                manager.findChainByRoundRobin(targetChain);
            // THEN
            expect(firstPublicClient).toBeUndefined();

            doneCallback();
        });
    });
});

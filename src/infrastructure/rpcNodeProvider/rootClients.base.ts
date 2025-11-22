import { Chain, createPublicClient, http, HttpTransport, PublicClient, Transport, webSocket, WebSocketTransport } from "viem"
import { ChainPublicClients } from "./chainPublicClients.iterface"

export class RootPublicClients implements ChainPublicClients {
    readonly clients: PublicClient<Transport, Chain>[];
    
    protected httpUrls: {chain: Chain, httpUrl: string}[]
    protected wssUrls: {chain: Chain, wssUrl: string}[]
    
    constructor(
        httpUrls: {chain: Chain, httpUrl: string}[],
        wssUrls: {chain: Chain, wssUrl: string}[],
    ) {
        this.httpUrls = httpUrls
        this.wssUrls = wssUrls

        this.clients = [
          ...this.createHttpPublicClients(),
          ...this.createWssPublicClients(),
        ];
    }

    createHttpPublicClients(): PublicClient<HttpTransport, Chain>[] {
        return this.httpUrls.map((value) => {
            return createPublicClient({
                chain: value.chain,
                transport: http(value.httpUrl)
            })
        })
    }

    createWssPublicClients(): PublicClient<WebSocketTransport, Chain>[] {
        return this.wssUrls.map((value) => {
            return createPublicClient({
                chain: value.chain,
                transport: webSocket(value.wssUrl)
            })
        })
    }
}

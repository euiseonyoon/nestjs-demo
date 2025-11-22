import {
  Chain,
  HttpTransport,
  PublicClient,
  Transport,
  WebSocketTransport,
} from 'viem';

export interface ChainPublicClients<TChain extends Chain = Chain> {
  readonly clients: PublicClient<Transport, TChain>[];

  createHttpPublicClients(): PublicClient<HttpTransport, Chain>[];

  createWssPublicClients(): PublicClient<WebSocketTransport, Chain>[];
}

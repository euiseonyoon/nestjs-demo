import { mainnet } from "viem/chains";
import { RootPublicClients } from "./root-clients.base";
import { Injectable } from "@nestjs/common";
import { ChainPublicClient } from "./chain-public-client.decorator";

@Injectable()
@ChainPublicClient()
export class EthereumChainPublicClientsImpl extends RootPublicClients{
  constructor() {
    let httpUrls = [
      {chain: mainnet, httpUrl: "https://eth.llamarpc.com"},
      {chain: mainnet, httpUrl: "https://ethereum-rpc.publicnode.com"}
    ]
    let wssUrls = [
      {chain: mainnet, wssUrl: "wss://ethereum-rpc.publicnode.com"}
    ]
    super(httpUrls, wssUrls)
  }
}


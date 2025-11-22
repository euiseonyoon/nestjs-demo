import { mainnet } from "viem/chains";
import { RootPublicClients } from "./rootClients.base";
import { Injectable } from "@nestjs/common";
import { ChainPublicClient } from "./chainPublicClient.decorator";

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


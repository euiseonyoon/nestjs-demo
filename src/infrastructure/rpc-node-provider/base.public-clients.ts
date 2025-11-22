import { base } from "viem/chains";
import { RootPublicClients } from "./root-clients.base";
import { Injectable } from "@nestjs/common";
import { ChainPublicClient } from "./chain-public-client.decorator";

@Injectable()
@ChainPublicClient()
export class BaseChainPublicClientsImpl extends RootPublicClients{
  constructor() {
    let httpUrls = [
      {chain: base, httpUrl: "https://base.llamarpc.com"},
    ]
    let wssUrls = [
      {chain: base, wssUrl: "wss://base-rpc.publicnode.com"}
    ]
    super(httpUrls, wssUrls)
  }
}

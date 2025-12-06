import { Chain } from "viem";

export type ChainInfo = Pick<
  Omit<Chain, "rpcUrls" | "nativeCurrency">, 
  "id" | "name" | "testnet"
>;
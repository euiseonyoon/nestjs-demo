import { Inject, Injectable } from "@nestjs/common";
import { ChainInfo } from "src/domain/chain-info.type";
import { IErc20InfoFetcher, TokenDetail } from "./erc20.info-fetcher.interface";
import { RPC_CLIENT_MANAGER } from "src/infrastructure/infrastructure.token";
import type { IRpcClientManager } from "src/application/transaction/required_port/tx.required-port";
import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { Address, Chain, erc20Abi, PublicClient } from "viem";
import * as chains from "viem/chains";

@Injectable()
export class Erc20InfoFetcher implements IErc20InfoFetcher {

    private readonly chainMap: Record<number, Chain> = Object.values(chains).reduce(
        (acc, chain) => {
            if (typeof chain === "object" && "id" in chain) {
            acc[chain.id] = chain as Chain;
            }
            return acc;
        },
        {} as Record<number, Chain>
    );
    
    constructor(
        @Inject(RPC_CLIENT_MANAGER)
        private readonly prcClientManager: IRpcClientManager
    ){}

    async getToken(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null> {
        if (Token.isNativeToken(tokenAddress.address)) {
            return this.getNativeToken(chainInfo, tokenAddress)
        } else {
            return this.getTokenByCallMethod(chainInfo, tokenAddress)
        }
    }

    private async getNativeToken(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null> {
        const chain = this.chainMap[chainInfo.id];
        if (!chain) return null

        return new Token(
            chainInfo,
            tokenAddress,
            chain.nativeCurrency.symbol,
            chain.nativeCurrency.decimals,
            chain.nativeCurrency.name,
            null,
            true,
        )
    }

    private async getTokenByCallMethod(chainInfo: ChainInfo, tokenAddress: EvmAddress): Promise<Token | null> {
        const client = this.prcClientManager.getRpcClient(chainInfo.id)
        if(!client) return null

        const details = await this.getTokenDetail(tokenAddress, client)

        return new Token(
            chainInfo,
            tokenAddress,
            details.symbol,
            details.decimals,
            details.name,
            null,
            Token.isNativeToken(tokenAddress.address)
        )
    }

    private async getTokenDetail(tokenAddress: EvmAddress, client: PublicClient): Promise<TokenDetail> {
        const viemTokenAddress = tokenAddress.address as Address
        const [decimals, name, symbol] = await Promise.all([
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'decimals'
            }),
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'name'
            }),
            client.readContract({
                address: viemTokenAddress,
                abi: erc20Abi,
                functionName: 'symbol'
            })
        ]);

        return { decimals, name, symbol };
    }
}

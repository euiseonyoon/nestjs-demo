import { OneInchHistoryResponseDto, OneInchTokensResponse } from "../1inch-swap.info-fetcher.response";
import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { ChainInfo } from "src/domain/chain-info.type";

export interface IOneInchInfoFetcher {
    fetSupporingChains(): Promise<ChainInfo[] | null>

    fetchSwapOutAmount(address: EvmAddress, chainId: number): Promise<OneInchHistoryResponseDto | null>

    fetchSupportingTokenByChainId(chainInfo: ChainInfo): Promise<OneInchTokensResponse | null>

    // 이더리움 0.5개를 swap한다면 amount는 "0.5"
    getClassicSwapQuote(srcToken: Token, dstToken: Token, amount: string): Promise<bigint | null>
}

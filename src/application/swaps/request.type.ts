import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { Token } from "src/domain/token.class";
import { TokenAmount } from "../../domain/common-defi.type";

// Same-chain swap
export type SameChainSwapQuoteRequest = {
    type: 'same-chain',
    chain: ChainInfo,
    srcToken: Token,
    dstToken: Token,
    amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
    slippagePercentStr: string // "0.5"는 0.5% -> 0.005
}

// Cross-chain swap
export type CrossChainSwapQuoteRequest = {
    type: 'cross-chain',
    srcChain: ChainInfo,
    dstChain: ChainInfo,
    srcToken: Token,
    dstToken: Token,
    amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
    slippagePercentStr: string // 0.5%
}

// Union
export type SwapQuoteRequest = SameChainSwapQuoteRequest | CrossChainSwapQuoteRequest;

export type SwapOutAmountRequest = {
    chainId: number,
    address: EvmAddress
    txHash: EvmTxHash,
}



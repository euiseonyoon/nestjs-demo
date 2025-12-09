import { ChainInfo } from "src/domain/chain-info.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { Token } from "src/domain/token.class";
import { TokenAmount } from "../../domain/common-defi.type";

export class NaiveSameChainSwapQuoteRequest {
    constructor(
        readonly chainId: number,
        readonly srcTokenAddress: EvmAddress,
        readonly dstTokenAddress: EvmAddress,
        readonly amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
        readonly slippagePercentStr: string // "0.5"는 0.5% -> 0.005
    ) {
        if(srcTokenAddress.getAddress().toLocaleLowerCase() === dstTokenAddress.getAddress().toLocaleLowerCase()) {
            throw new Error("SrcToken and DstToken should be different tokens.");
        }
    }
}

export class NaiveCrossChainSwapQuoteRequest {
    constructor(
        readonly srcChainId: number,
        readonly dstChainId: number,
        readonly srcTokenAddress: EvmAddress,
        readonly dstTokenAddress: EvmAddress,
        readonly amount: string, // token의 deciamls가 반영되지 않은 값 (1.5 이더리움 swap이면, amount = 1.5)
        readonly slippagePercentStr: string // "0.5"는 0.5% -> 0.005
    ) {
        if(srcChainId === dstChainId) {
            throw new Error("srcChainId and dstChainId should be different.");
        }

        if(srcTokenAddress.getAddress().toLocaleLowerCase() === dstTokenAddress.getAddress().toLocaleLowerCase()) {
            throw new Error("SrcToken and DstToken should be different tokens.");
        }
    }
}

// Union
export type NaiveSwapQuoteRequest = NaiveSameChainSwapQuoteRequest | NaiveCrossChainSwapQuoteRequest;

export type SwapOutAmountRequest = {
    chainId: number,
    address: EvmAddress
    txHash: EvmTxHash,
}



// stargate chain list 
// https://stargate.finance/api/v1/chains
export type StargateNativeCurrency = {
    chainKey: string,
    name: string,
    symbol: string,
    decimals: number,
    address: string,
}

export type StargateChainDetail = {
    chainKey: string,
    chainType: string,
    chainId: number,
    shortName: string,
    name: string,
    nativeCurrency: StargateNativeCurrency
}

export type StargateChainResponse = {
    chains: StargateChainDetail[]
}

// stargate quote 
// https://stargate.finance/api/v1/quotes
export type StargateQuoteFee = {
    token: string,
    chainKey: string,
    amount: string,
    type: string,
}

export type StargateQuoteTransaction = {
    data: string,
    from: string,
    to: string,
    value: string,
}

export type StargateQuoteStep = {
    type: string,
    sender: string,
    chainKey: string,
    transaction: StargateQuoteTransaction,
}

export type StargateQuoteDuration = {
    estimated: number
}

export type StargateQuoteDetailResponse = {
    route: string,
    erorr: any,
    srcAmount: string,
    dstAmount: string,
    srcAmountMax: string,
    dstAmountMin: string,
    srcToken: string,
    dstToken: string,
    srcAddress: string, // src wallet address 
    dstAddrss: string, // dst wallet address
    srcChainKey: string,
    dstChainKey: string,
    dstNativeAmount: string,
    duration: StargateQuoteDuration,
    fees: StargateQuoteFee[],
    steps: StargateQuoteStep[],
}

export type StargateQuoteResponse = {
    quotes: StargateQuoteDetailResponse[],
}

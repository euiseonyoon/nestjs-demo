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

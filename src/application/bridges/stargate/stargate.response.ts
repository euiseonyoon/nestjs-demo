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

// layerzeroscan response
// https://docs.layerzero.network/v2/tools/api/scan/mainnet - /messages/tx/{tx}
// https://scan.layerzero-api.com/v1/messages/tx/${txHash}

export type PathwayParticipant = {
    address: string,
    id: string,
    name: string,
    chain: string,
}

export type Pathway = {
    srcEid: number,
    dstEid: number,
    sender: PathwayParticipant,
    receiver: PathwayParticipant,
    id: string,
    nonce: number,
}

export type SourceTransaction = {
    txHash: string,
    blockHash: string,
    blockNumber: string,
    blockTimestamp: number,
    from: string,
    payload: string,
    readinessTimestamp: number,
    options: SourceTransactionOptions,
}

export type SourceTransactionOptions = {
    lzReceive: LzReceive,
    ordered: boolean
}

export type LzReceive = {
    gas: string,
    value: string,
}

export type Source = {
    status: string,
    tx: SourceTransaction,
}

export type DestinationTransaction = {
    txHash: string,
    blockHash: string,
    blockNumber: number,
    blockTimestamp: number,
}

export type Destination = {
    tx: DestinationTransaction,
    status: string,
}

export type LayerZeroStatus = {
    name: string,
    message: string,
}

export type LayerZeroScanBridgeData = {
    pathway: Pathway,
    source: Source,
    destination: Destination,
    guid: string,
    status: LayerZeroStatus,
    created: string,
    updated: string,
}

export type LayerZeroScanBridgeResponse = {
    data: LayerZeroScanBridgeData[]
}


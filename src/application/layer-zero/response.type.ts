
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

// stargate chain list 
// https://stargate.finance/api/v1/chains
export type StargateNativeCurrency = {
    chainKey: string,
    name: string,
    symbol: string,
    decimals: number,
    address: string,
}

/** 
{
    "chainKey": "ethereum",  <-- 이 chainKey가 다른 stargate api에서 필수이기 때문에 저장해야 한다.
    "chainType": "evm",
    "chainId": 1,
    "shortName": "Ethereum",
    "name": "Ethereum",
    "nativeCurrency": {
        "chainKey": "ethereum",
        "name": "ETH",
        "symbol": "ETH",
        "decimals": 18,
        "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    }
}
*/
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


// stargate token list
// https://docs.stargate.finance/developers/api-docs/tokens
export type StargateTokenDetail = {
    isBridgeable: boolean,
    chainKey: string,
    address: string,
    decimals: number,
    symbol: string,
    name: string,
}

export type StargateTokenReponse = {
    tokens: StargateTokenDetail[]
}
// HTTP Client
export const HTTP_CLIENT = Symbol('HttpClient');
export const AXIOS_ERROR_RESPONSE_HANDLER = Symbol('AxiosErrorResponseHandler');

// Swap Services
export const SWAP_SERVICES = Symbol('SwapServices');

// Swap Quoters
export const ONE_INCH_SWAP_QUOTER = Symbol('OneInchSwapQuoter');
export const SUSHI_SWAP_QUOTER = Symbol('SushiSwapQuoter');

// Swap Amount Getters
export const ONE_INCH_SWAP_AMOUNT_GETTER = Symbol('OneInchSwapAmountGetter');
export const SUSHI_SWAP_AMOUNT_GETTER = Symbol('SushiSwapAmountGetter');

// Bridge Services
export const BRIDGE_SERVICES = Symbol('BridgeServices');

// Bridge Quoters
export const STARGATE_QUOTER = Symbol('StargateQuoter');

// Bridge Amount Getters
export const STARGATE_BRIDGE_AMOUNT_GETTER = Symbol('StargateAmountGetter');

// Info Providers
export const ONE_INCH_SWAP_INFO_PROVIDER = Symbol('OneInchSwapInfoProvider');
export const SUSHI_SWAP_INFO_PROVIDER = Symbol('SushiSwapInfoProvider');
export const STARGATE_BRIDGE_INFO_PROVIDER = Symbol('StargateInfoProvider');

// Info Fetchers
export const ONE_INCH_INFO_FETCHER = Symbol('OneInchInfoFetcher')

// Layer Zero
export const LAYER_ZERO_SERVICE = Symbol('LayerZeroService');

// Transaction
export const TX_SERVICE = Symbol('TxService');

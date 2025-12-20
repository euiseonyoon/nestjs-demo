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
export const STABLE_COIN_INFO_PROVIDER = Symbol('StableCoinInfoProvider');

// Info Fetchers
export const ONE_INCH_INFO_FETCHER = Symbol('OneInchInfoFetcher')
export const STABLE_COIN_INFO_FETCHER = Symbol('StableCoinInfoFetcher')

// Layer Zero
export const LAYER_ZERO_SERVICE = Symbol('LayerZeroService');

// Transaction
export const TX_SERVICE = Symbol('TxService');

// XSwapRoute
export const X_SWAP_CHAIN_REPOSITORY = Symbol('XSwapChainRepository')
export const X_SWAP_PROTOCOL_REPOSITORY = Symbol('XSwapProtocolRepository')
export const X_SWAP_TOKEN_REPOSITORY = Symbol('XSwapTokenRepository')
export const X_SWAP_ROUTE_REPOSITORY = Symbol('XSwapRouteRepsitory');
export const X_SWAP_ROUTE_FINDER = Symbol('XSwapRouteFinder');
export const X_SWAP_ROUTE_SERVICE = Symbol('XSwapRouteService')
export const X_SWAP_ROUTE_RESULT_CONVERTER = Symbol('XSwapRouteResultConverter')

// Cache
export const CACHE_REGISTRY = Symbol('CacheRegistry');

// 1inch info privder token cache
export const ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_REPO = Symbol("OneInchInfoProviderTokenCacheRepository");
export const ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_INSTANCE = Symbol("OneInchInfoProviderTokenCacheInstance");
export const ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_KEY_GENERATOR = Symbol("OneInchInfoProviderTokenCacheGenerator");
export const ONE_INCH_INFO_PROVIDER_TOKEN_CACHE_NAME = Symbol("OneInchInfoProviderTokenCacheName");
// 1inch info privder supporting chain cache
export const ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_REPO = Symbol("OneInchInfoProviderChainCacheRepository");
export const ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_INSTANCE = Symbol("OneInchInfoProviderChainCacheInstance");
export const ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_KEY_GENERATOR = Symbol("OneInchInfoProviderChainCacheGenerator");
export const ONE_INCH_INFO_PROVIDER_CHAIN_CACHE_NAME = Symbol("OneInchInfoProviderChainCacheName");
// stable info provider stable coin cache
export const STABLE_COIN_CACHE_REPO = Symbol("StableCoinCacheRepo");
export const STABLE_COIN_CACHE_INSTANCE = Symbol("StableCoinCacheInstance");
export const STABLE_COIN_CACHE_KEY_GENERATOR = Symbol("StableCoinCacheKeyGenerator");
export const STABLE_COIN_CACHE_NAME = Symbol("StableCoinCacheName");

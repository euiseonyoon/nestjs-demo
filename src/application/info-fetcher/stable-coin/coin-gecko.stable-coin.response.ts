export interface CoinGeckoDetailPlatform {
  decimal_place: number | null;
  contract_address: string;
  geckoterminal_url?: string;
}

export interface CoinGeckoCoinDetailResponse {
  id: string;
  symbol: string;
  name: string;
  web_slug: string;
  asset_platform_id: string | null;
  platforms: Record<string, string>;
  detail_platforms: Record<string, CoinGeckoDetailPlatform>;
}

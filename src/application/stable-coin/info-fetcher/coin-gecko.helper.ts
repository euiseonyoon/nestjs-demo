import { PLATFORM_TO_CHAIN_ID } from "./coin-gecko.constant";
import { CoinGeckoCoinDetailResponse } from "./coin-gecko.stable-coin.response";
import { Token } from "src/domain/token.class";
import { EvmAddress } from "src/domain/evm-address.class";
import { ChainInfo } from "src/domain/chain-info.type";

export class CoinGeckoHelper {
    static getChainInfo(platform: string): ChainInfo | null{
        const id = PLATFORM_TO_CHAIN_ID[platform]
        if (!id) return null
        return {
            id: id,
            name: platform,
            testnet: false
        }
    }

    static getEvmStableCoins(response: CoinGeckoCoinDetailResponse): Token[] {
        return Object.entries(response.detail_platforms).map(([platform, details]) => {
            const contractAddressStr = details.contract_address
            if (EvmAddress.validateAddress(contractAddressStr)) {
                const chainInfo = CoinGeckoHelper.getChainInfo(platform)
                if (chainInfo) {
                    return new Token(
                    chainInfo,
                    new EvmAddress(contractAddressStr),
                    response.symbol.toUpperCase(),
                    details.decimal_place!,
                    response.name,
                    null,
                    false,
                )
                }
            }
        }).filter((value) => value !== undefined);
    }
}


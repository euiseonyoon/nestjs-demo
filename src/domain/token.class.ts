"address"
import Decimal from "decimal.js";
import { ChainInfo } from "./chain-info.type"
import { EvmAddress } from "./evm-address.class"
import { OneInchTokenData } from "src/application/info-provider/swap/1inch/1inch-api.response";

export const E_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const E_ADDRESS_LOWER = E_ADDRESS.toLowerCase()

export class Token {
    constructor(
        public readonly chain: ChainInfo,
        public readonly address: EvmAddress,
        public readonly symbol: string,
        public readonly decimals: number,
        public readonly name: string,
        public readonly logoUri: string | null,
        public readonly isNativeToken: boolean
    ) {
        if (isNativeToken) {
            if (!address.equals(E_ADDRESS_LOWER)) {
                throw Error(`Native token address should be ${E_ADDRESS}`)
            }
        }
    }

    // 1 USDT -> 100000 Wei USDT
    convertToBigIntAmount(amount: string): bigint {
        const amountInDecimal: Decimal = new Decimal(amount);
        const weiDecimal: Decimal = amountInDecimal.times(new Decimal(10).toPower(this.decimals));
        const weiString: string = weiDecimal.toFixed(0, Decimal.ROUND_DOWN);
        return BigInt(weiString);
    }

    // 100000 Wei USDT -> 1 USDT
    convertToStringFromWei(amountWei: bigint): string {
        const amountInDecimal = new Decimal(amountWei.toString())
        const humanReadableAmount: Decimal = amountInDecimal.dividedBy(new Decimal(10).toPower(this.decimals));
        return humanReadableAmount.toString();
    }

    public equals(other: Token): boolean {
        return this.chain.id === other.chain.id && 
            this.address.equals(other.address);
    }

    static fromOneInchTokenData(tokenData: OneInchTokenData, chainInfo: ChainInfo): Token {
        return new Token(
            chainInfo,
            new EvmAddress(tokenData.address),
            tokenData.symbol,
            tokenData.decimals,
            tokenData.name,
            tokenData.logoURI,
            this.isNativeToken(tokenData.address),
        )
    }

    static isNativeToken(tokenAddress: string): boolean {
        return tokenAddress.toLowerCase() === E_ADDRESS_LOWER
    }
}

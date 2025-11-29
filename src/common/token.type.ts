"address"
import Decimal from "decimal.js";
import { ChainInfo } from "./chain-info.type"
import { EvmAddress } from "./evm-address.class"

export class Token {
    constructor(
        public readonly chain: ChainInfo,
        public readonly address: EvmAddress,
        public readonly symbol: string,
        public readonly decimals: number,
        public readonly name: string,
        public readonly logoUri: string | undefined
    ) {}

    convertToBigIntAmount(amount: string): bigint {
        const amountInDecimal: Decimal = new Decimal(amount);
        const weiDecimal: Decimal = amountInDecimal.times(new Decimal(10).toPower(this.decimals));
        const weiString: string = weiDecimal.toFixed(0, Decimal.ROUND_DOWN);
        return BigInt(weiString);
    }
}

import { Token } from "src/domain/token.class";

export type TokenAmount = {
    amountWei: bigint,
    token: Token,
}
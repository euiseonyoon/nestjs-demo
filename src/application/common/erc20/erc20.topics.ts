import { Hex, toEventSelector } from "viem";

export const ERC20_TOPICS = {
    // 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    TRANSFER: toEventSelector(
        'event Transfer(address indexed from, address indexed to, uint256 value)'
    )
} as const


import { toEventSelector } from "viem";

export const LAYERZERO_TOPICS = {
    // 0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c
    OFT_RECEIVED: toEventSelector(
        'event OFTReceived(bytes32 indexed guid, uint32 srcEid, address indexed toAddress, uint256 amountReceivedLD)'
    )
} as const
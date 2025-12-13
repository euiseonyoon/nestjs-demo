export const LAYERZERO_OFT_ABI = [
    {
        type: 'event',
        name: 'OFTReceived',
        inputs: [
            { name: 'guid', type: 'bytes32', indexed: true },
            { name: 'srcEid', type: 'uint32', indexed: false },
            { name: 'toAddress', type: 'address', indexed: true },
            { name: 'amountReceivedLD', type: 'uint256', indexed: false }
        ]
    },
] as const


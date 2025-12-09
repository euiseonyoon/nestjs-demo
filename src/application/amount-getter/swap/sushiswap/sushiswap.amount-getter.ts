import { Inject, Injectable } from "@nestjs/common";
import { ISwapAmountGetter } from "../provided_port/swap.amount-getter";
import { SwapOutAmountRequest } from "../request.swap-smount";
import { TokenAmount } from "src/domain/common-defi.type";
import { TX_SERVICE } from "src/module/tx.module";
import { type ITxService } from "src/application/transaction/provided_port/tx.provided-port";
import { SUSHI_SWAP_INFO_PROVIDER } from "src/module/info-provider.module";
import { type IDefiProtocolInfoProvider } from "src/application/defi.info-provider/provided_port/defi-info-provider.interface";
import { EvmAddress } from "src/domain/evm-address.class";
import { Log, TransactionReceipt } from "viem";

@Injectable()
export class SushiSwapAmoutGetter implements ISwapAmountGetter{
    // Transfer (index_topic_1 address from, index_topic_2 address to, uint256 value)
    // topic[1]은 from주소, topic[2]는 to 주소
    private readonly transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    
    constructor(
        @Inject(TX_SERVICE)
        private readonly txService: ITxService,
        @Inject(SUSHI_SWAP_INFO_PROVIDER)
        private readonly sushiSwapInfoProvider: IDefiProtocolInfoProvider,
    ) {}

    async getSwapOutAmount(request: SwapOutAmountRequest): Promise<TokenAmount | null> {
        const receipt = await this.txService.getTxReceipt(request.txHash, request.chain.id)
        if (!receipt) return null

        const log = await this.findTargetLog(receipt, request.receiverAddress)
        if(!log) return null

        const swapOutToken = await this.sushiSwapInfoProvider.getSupportingToken(request.chain.id, new EvmAddress(log.address))
        if (!swapOutToken) return null
        
        return {
            amount: BigInt(log.data),
            token: swapOutToken,
        }
    }

    private async findTargetLog(receipt: TransactionReceipt, receiverAddress: EvmAddress): Promise<Log | null> {
        return receipt.logs.find((log) =>{
            const matchSignature = log.topics[0]?.toLowerCase() === this.transferEventSignature
            const matchTo = log.topics[2]?.toLowerCase() === receiverAddress.getAddress().toLowerCase()

            matchSignature && matchTo
        }) ?? null
    }
}

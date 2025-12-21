import { Inject, Injectable } from "@nestjs/common";
import { ISwapAmountGetter } from "../provided_port/swap.amount-getter";
import { SwapOutAmountRequest } from "../request.swap-smount";
import { TokenAmount } from "src/domain/common-defi.type";
import { TX_SERVICE } from "src/module/module.token";
import { type ITxService } from "src/application/transaction/provided_port/tx.provided-port";
import { SUSHI_SWAP_INFO_PROVIDER } from "src/module/module.token";
import { AbstractDefiProtocolInfoProvider } from "src/application/info-provider/provided_port/defi-info-provider.interface";
import { EvmAddress } from "src/domain/evm-address.class";
import { Hex, Log, pad, TransactionReceipt } from "viem";
import { ERC20_TOPICS } from "src/application/common/erc20/erc20.topics";

@Injectable()
export class SushiSwapAmoutGetter implements ISwapAmountGetter{
    constructor(
        @Inject(TX_SERVICE)
        private readonly txService: ITxService,
        @Inject(SUSHI_SWAP_INFO_PROVIDER)
        private readonly sushiSwapInfoProvider: AbstractDefiProtocolInfoProvider,
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
        const transferSignature = ERC20_TOPICS.TRANSFER.toString().toLowerCase()
        // 이더리움 로그 토픽에 저장되는 주소는 항상 32바이트로 앞쪽에 0으로 패딩(Padding)되어 있다.
        const receiverTopic = pad(receiverAddress.address as Hex, { size: 32 }).toLowerCase();
        
        return receipt.logs.find((log) => {
            const matchSignature = log.topics[0]?.toLowerCase() === transferSignature
            const matchTo = log.topics[2]?.toLowerCase() === receiverTopic

            return matchSignature && matchTo;
        }) ?? null
    }
}

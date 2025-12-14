import { Inject, Injectable } from "@nestjs/common";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { IBridgeAmountGetter } from "../provided_port/bridge.amount-getter";
import { type ILayerZeroService } from "src/application/bridges/stargate/required_port/layer-zero.interface";
import { BridgeAmountRequest } from "../response.bridge-amount";
import { BridgeOutAmountResponse } from "../request.bridge-amount";
import { LAYER_ZERO_SERVICE } from "src/module/module.token";

@Injectable()
export class StargateAmountGetter implements IBridgeAmountGetter {
    constructor(
        @Inject(LAYER_ZERO_SERVICE)
        private readonly layerZeroService: ILayerZeroService,
    ) {}

    async getBridgeOutAmount(request: BridgeAmountRequest) : Promise<BridgeOutAmountResponse | null> {
        const data = await this.layerZeroService.fetchBridgeInfo(request.srcTxHash)
        if (!data) return null
        if(data.status.name != 'DELIVERED') {
            return { status: data.status.name, bridgeOutAmount: null};
        }
        
        const receipt = await this.layerZeroService.getTxReceiptUsingDstInfo(data.pathway.dstEid, new EvmTxHash(data.destination.tx.txHash))
        if (!receipt) return null
        
        const bridgeOutAmount = await this.layerZeroService.getBridgeOutAmountFromReceipt(receipt)
        if (!bridgeOutAmount) return null

        return {
            status: data.status.name,
            bridgeOutAmount: {
                amount: bridgeOutAmount,
                token: request.dstToken
            }
        }
    }
}

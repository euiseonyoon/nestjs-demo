import { Inject, Injectable } from "@nestjs/common";
import { IBridgeService } from "../provided_port/bridge.interface";
import { BridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse } from "../response.type";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { LAYER_ZERO_SERVICE } from "src/module/bridge-sub.module";
import { type ILayerZeroService } from "./required_port/layer-zero.interface";
import { STARGATE_BRIDGE_INFO_PROVIDER } from "src/module/info-provider.module";
import { type IStargateInfoProvider } from "./required_port/stargate.info-provider";
import { STARGATE_QUOTER } from "src/module/bridge.quoter.module";
import { type IBridgeQuoter } from "src/application/quoter/bridge/provided_port/bridge.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { BridgeQuoteRequest } from "src/application/quoter/bridge/request.type";

@Injectable()
export class StargateService implements IBridgeService {
    constructor(
        @Inject(LAYER_ZERO_SERVICE)
        private readonly layerZeroService: ILayerZeroService,
        @Inject(STARGATE_BRIDGE_INFO_PROVIDER)
        private readonly stargateInfoProvider: IStargateInfoProvider,
        @Inject(STARGATE_QUOTER)
        private readonly stargateQuoter: IBridgeQuoter,
    ) {}

    async getBridgeOutAmount(request: BridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null> {
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
    
    async getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null> {

        const convertedRequest = await this.convertQuoteRequest(request)
        if (!convertedRequest) return null

        return this.stargateQuoter.getQuote(convertedRequest)
    }

    async convertQuoteRequest(request: NavieBridgeQuoteRequest): Promise<BridgeQuoteRequest | null> {
        const [srcChain, dstChain, srcToken, dstToken] = await Promise.all([
            this.stargateInfoProvider.getSupportingChainInfo(request.srcChainId),
            this.stargateInfoProvider.getSupportingChainInfo(request.dstChainId),
            this.stargateInfoProvider.getSupportingToken(request.srcChainId, request.srcTokenAddress),
            this.stargateInfoProvider.getSupportingToken(request.dstChainId, request.dstTokenAddress),
        ])

        if (!srcChain || !dstChain || !srcToken || !dstToken) return null

        return {
            srcToken: srcToken,
            dstToken: dstToken,
            amount: request.bridgeInAmount,
            receiverAddress: request.receiverAddress,
            senderAddresss: request.senderAddresss,
        }
    }
}

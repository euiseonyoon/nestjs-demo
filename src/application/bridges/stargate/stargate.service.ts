import { Inject, Injectable } from "@nestjs/common";
import { IBridgeService } from "../provided_port/bridge.interface";
import { NaiveBridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { STARGATE_BRIDGE_INFO_PROVIDER } from "src/module/info-provider.module";
import { type IStargateInfoProvider } from "./required_port/stargate.info-provider";
import { STARGATE_QUOTER } from "src/module/bridge.quoter.module";
import { type IBridgeQuoter } from "src/application/quoter/bridge/provided_port/bridge.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { BridgeQuoteRequest } from "src/application/quoter/bridge/request.type";
import { type IBridgeAmountGetter } from "src/application/amount-getter/bridge/provided_port/bridge.amount-getter";
import { BridgeAmountRequest } from "src/application/amount-getter/bridge/response.bridge-amount";
import { STARGATE_BRIDGE_AMOUNT_GETTER } from "src/module/bridge.amount-getter.module";
import { BridgeOutAmountResponse } from "src/application/amount-getter/bridge/request.bridge-amount";

@Injectable()
export class StargateService implements IBridgeService {
    constructor(
        @Inject(STARGATE_BRIDGE_INFO_PROVIDER)
        private readonly stargateInfoProvider: IStargateInfoProvider,
        @Inject(STARGATE_QUOTER)
        private readonly stargateQuoter: IBridgeQuoter,
        @Inject(STARGATE_BRIDGE_AMOUNT_GETTER)
        private readonly stargateAmountGetter: IBridgeAmountGetter,
    ) {}

    async getBridgeOutAmount(request: NaiveBridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null> {
        const convertedRequest = await this.convertAmountRquest(request)
        if (!convertedRequest) return null

        return this.stargateAmountGetter.getBridgeOutAmount(convertedRequest)
    }

    private async convertAmountRquest(naiveRequest: NaiveBridgeHistoryRequest) : Promise<BridgeAmountRequest | null> {
        const supportedResult = await this.stargateInfoProvider.getSupprtedTokens(
            naiveRequest.srcChainId, 
            naiveRequest.dstChainId, 
            naiveRequest.srcTokenAddress, 
            naiveRequest.dstTokenAddress,
        )
        if (!supportedResult) return null

        return {
            srcToken : supportedResult.srcToken,
            dstToken: supportedResult.dstToken,
            srcTxHash: naiveRequest.srcTxHash
        }
    }
    
    async getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null> {

        const convertedRequest = await this.convertQuoteRequest(request)
        if (!convertedRequest) return null

        return this.stargateQuoter.getQuote(convertedRequest)
    }

    async convertQuoteRequest(request: NavieBridgeQuoteRequest): Promise<BridgeQuoteRequest | null> {
        const supportedResult = await this.stargateInfoProvider.getSupprtedTokens(
            request.srcChainId,
            request.dstChainId,
            request.srcTokenAddress,
            request.dstTokenAddress,
        )
        if (!supportedResult) return null

        return {
            srcToken: supportedResult.srcToken,
            dstToken: supportedResult.dstToken,
            amount: request.bridgeInAmount,
            receiverAddress: request.receiverAddress,
            senderAddresss: request.senderAddresss,
        }
    }
}

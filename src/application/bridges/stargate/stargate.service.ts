import { Inject, Injectable } from "@nestjs/common";
import { AbstractBridgeService } from "../provided_port/abstract.bridge.service";
import { NaiveBridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { STARGATE_BRIDGE_INFO_PROVIDER } from "src/module/module.token";
import { AbstractStargateInfoProvider } from "./required_port/stargate.info-provider.interface";
import { STARGATE_QUOTER } from "src/module/module.token";
import { type IBridgeQuoter } from "src/application/quoter/bridge/provided_port/bridge.quoter";
import { TokenAmount } from "src/domain/common-defi.type";
import { type IBridgeAmountGetter } from "src/application/amount-getter/bridge/provided_port/bridge.amount-getter";
import { STARGATE_BRIDGE_AMOUNT_GETTER } from "src/module/module.token";
import { BridgeOutAmountResponse } from "src/application/amount-getter/bridge/request.bridge-amount";

@Injectable()
export class StargateService extends AbstractBridgeService {
    constructor(
        @Inject(STARGATE_BRIDGE_INFO_PROVIDER)
        private readonly stargateInfoProvider: AbstractStargateInfoProvider,
        @Inject(STARGATE_QUOTER)
        private readonly stargateQuoter: IBridgeQuoter,
        @Inject(STARGATE_BRIDGE_AMOUNT_GETTER)
        private readonly stargateAmountGetter: IBridgeAmountGetter,
    ) {
        super(stargateInfoProvider)
    }

    async getBridgeOutAmount(request: NaiveBridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null> {
        const convertedRequest = await this.convertAmountRquest(request)
        if (!convertedRequest) return null

        return this.stargateAmountGetter.getBridgeOutAmount(convertedRequest)
    }
    
    async getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null> {
        const convertedRequest = await this.convertQuoteRequest(request)
        if (!convertedRequest) return null

        return this.stargateQuoter.getQuote(convertedRequest)
    }
}

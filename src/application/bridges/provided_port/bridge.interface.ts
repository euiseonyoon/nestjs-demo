import { TokenAmount } from "src/domain/common-defi.type";
import { NaiveBridgeHistoryRequest, NavieBridgeQuoteRequest } from "../request.type";
import { BridgeOutAmountResponse } from "src/application/amount-getter/bridge/request.bridge-amount";
import { AbstractDefiProtocolInfoProvider } from "src/application/info-provider/provided_port/defi-info-provider.interface";
import { BridgeAmountRequest } from "src/application/amount-getter/bridge/response.bridge-amount";
import { BridgeQuoteRequest } from "src/application/quoter/bridge/request.type";
import { BridgeProtocol } from "src/domain/defi-type.enum";

export abstract class AbstractBridgeService {
    constructor(
        protected readonly infoProvider: AbstractDefiProtocolInfoProvider
    ) {}

    abstract readonly protocol: BridgeProtocol

    abstract getQuote(request: NavieBridgeQuoteRequest): Promise<TokenAmount | null>

    abstract getBridgeOutAmount(request: NaiveBridgeHistoryRequest) : Promise<BridgeOutAmountResponse | null>

    protected async convertQuoteRequest(request: NavieBridgeQuoteRequest): Promise<BridgeQuoteRequest | null> {
        const supportedResult = await this.infoProvider.getSupprtedTokens(
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

    protected async convertAmountRquest(naiveRequest: NaiveBridgeHistoryRequest) : Promise<BridgeAmountRequest | null> {
        const supportedResult = await this.infoProvider.getSupprtedTokens(
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
}

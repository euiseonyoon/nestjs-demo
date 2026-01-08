import { Inject, Injectable } from "@nestjs/common";
import { AbstractBridgeService } from "src/application/bridges/provided_port/bridge.interface";
import { NavieBridgeQuoteRequest } from "src/application/bridges/request.type";
import { BRIDGE_SERVICES } from "src/module/module.token";
import { Token } from "src/domain/token.class";
import { TokenAmount } from "src/domain/common-defi.type";
import { makeQuoteRouteStep, QuoteRoute } from "src/domain/x-swap.type";
import { EvmAddress } from "src/domain/evm-address.class";
import { IXSwapRouteBridgeHelper, BridgeRouteRequest } from "../required_port/x-swap.route.bridge.helper.interface";

@Injectable()
export class XSwapRouteBridgeHelper implements IXSwapRouteBridgeHelper {
    constructor(
        @Inject(BRIDGE_SERVICES)
        private readonly bridgeServices: AbstractBridgeService[],
    ) {}

    async checkOneBridgeRoute(request: BridgeRouteRequest): Promise<QuoteRoute | null> {
        const { srcToken, dstToken, srcAmount, userAccount } = request;
        // Note: srcAmount is human-readable (e.g., "0.5" for 0.5 ETH), NOT wei

        // Early exit: Bridge only works cross-chain
        if (srcToken.chain.id === dstToken.chain.id) {
            return null;
        }

        // Try each bridge service (currently only Stargate)
        for (const bridgeService of this.bridgeServices) {
            const quote = await this.getBridgeQuote(
                srcToken,
                dstToken,
                srcAmount,
                userAccount,
                bridgeService
            );

            if (quote) {
                const step = makeQuoteRouteStep(
                    srcToken,
                    dstToken,
                    bridgeService.protocol,
                    quote
                );
                return { steps: [step] };
            }
        }

        return null;
    }

    private async getBridgeQuote(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string, // Human-readable amount (NOT wei). Example: "0.5" for 0.5 ETH
        userAccount: EvmAddress,
        bridgeService: AbstractBridgeService,
    ): Promise<TokenAmount | null> {
        try {
            // Convert human-readable string to number (e.g., "0.5" -> 0.5)
            // Note: This is NOT wei amount. NavieBridgeQuoteRequest expects human-readable number.
            const bridgeInAmount = parseFloat(srcAmount);

            if (isNaN(bridgeInAmount) || bridgeInAmount <= 0) {
                return null;
            }

            const bridgeRequest: NavieBridgeQuoteRequest = {
                srcChainId: srcToken.chain.id,
                dstChainId: dstToken.chain.id,
                srcTokenAddress: srcToken.address,
                dstTokenAddress: dstToken.address,
                bridgeInAmount: bridgeInAmount, // Human-readable number (e.g., 1.5 for 1.5 ETH)
                receiverAddress: userAccount,
                senderAddresss: userAccount, // Note: typo exists in type definition
            };

            return await bridgeService.getQuote(bridgeRequest);
        } catch (error) {
            console.error(
                `Bridge quote failed for ${bridgeService.protocol}:`,
                error
            );
            return null;
        }
    }
}

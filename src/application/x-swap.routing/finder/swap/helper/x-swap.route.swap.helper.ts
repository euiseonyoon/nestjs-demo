import { NaiveSameChainSwapQuoteRequest } from "src/application/swaps/request.type";
import { IXSwapRouteSwapHelper, makePossibleDoubleSwapInfo, PossibleDoubleSwapInfo, SupportingSwapServiceInfo } from "../required_port/x-swap.route.swap.helper.interface";
import { AbstractSwapService } from "src/application/swaps/provided_port/swap.interface";
import { TokenAmount } from "src/domain/common-defi.type";
import { Token } from "src/domain/token.class";
import { makeQuoteRouteStep, QuoteRoute } from "src/domain/x-swap.type";
import { compact } from "lodash";
import { STABLE_COIN_INFO_PROVIDER, SWAP_SERVICES } from "src/module/module.token";
import { Inject, Injectable } from "@nestjs/common";
import type { IStableCoinInfoProvider } from "src/application/info-provider/stable-coin/provided_port/info-provider.interface";

@Injectable()
export class XSwapRouteSwapHelper implements IXSwapRouteSwapHelper {
    constructor(
        @Inject(SWAP_SERVICES)
        private readonly swapServices: AbstractSwapService[],
        @Inject(STABLE_COIN_INFO_PROVIDER)
        private readonly stableCoinInfoProvider: IStableCoinInfoProvider,
    ){}

    async checkOneSwapRoute(srcToken: Token, dstToken: Token, srcAmount: string, slippagePercentStr: string): Promise<QuoteRoute[]> {
        const result = await Promise.all(
            this.swapServices.map(async (swapService) => {
                const quote = await this.getSwapQuote(srcToken, dstToken, srcAmount, slippagePercentStr, null, swapService)

                if (quote) {
                    const step = makeQuoteRouteStep(srcToken, dstToken, swapService.protocol, quote)
                    return { steps: [step] } as QuoteRoute
                }
            })
        );
        return compact(result)
    }

    async checkDoubleSwapRoute(srcToken: Token, dstToken: Token, srcAmount: string, slippagePercentStr: string): Promise<QuoteRoute[]> {
        const doubleSwapInfos = await this.findPossibleDoubleSwapInfos(srcToken, dstToken)
        if (!doubleSwapInfos) return []

        const result = await Promise.all(
            doubleSwapInfos.map(async (info) => {
                const firstSwapService = info.firstSwapService
                const stableToken = info.stableToken
                const secondSwapService = info.secondSwapService

                // srcToken -- First Swap service --> stableToken quote검사
                const firstSwapQuote = await this.getSwapQuote(srcToken, stableToken, srcAmount, slippagePercentStr, null, firstSwapService)
                if (!firstSwapQuote) return

                // stableToken -- Second Swap service --> dstToken quote검사
                const stableCoinAmountHuman = stableToken.convertToStringFromWei(firstSwapQuote.amountWei);
                const secondSwapQuote = await this.getSwapQuote(stableToken, dstToken, stableCoinAmountHuman, slippagePercentStr, null, secondSwapService)

                if(secondSwapQuote) {
                    const firstStep = makeQuoteRouteStep(srcToken, stableToken, firstSwapService.protocol, firstSwapQuote)
                    const secondStep = makeQuoteRouteStep(stableToken, dstToken, secondSwapService.protocol, secondSwapQuote)

                    return {
                        steps: [firstStep, secondStep]
                    } as QuoteRoute
                }
            })
        )
        return compact(result)
    }

    async findPossibleDoubleSwapInfos(
        srcToken: Token,
        finalDstToken: Token,
    ): Promise<PossibleDoubleSwapInfo[]> {
        const availableStableCoins = await this.stableCoinInfoProvider.getStableCoins(srcToken.chain);
        if (!availableStableCoins) return [];

        const firstSwapServiceCandidates = await this.findSupportingSwapService(
            this.swapServices,
            srcToken,
            availableStableCoins
        );

        const allRoutes = await Promise.all(
            firstSwapServiceCandidates.map(async ({ swapService: firstSwapService, supportedSwapOutToken }) => {
                const secondSwapServicesCandidates = this.excludeVisitedSwapService(firstSwapService);

                const routes = await Promise.all(
                    supportedSwapOutToken.map(async (stableToken) => {
                        const secondSwapServices = (
                            await this.findSupportingSwapService(
                                secondSwapServicesCandidates,
                                stableToken,
                                [finalDstToken]
                            )
                        ).map((value) => value.swapService);

                        return secondSwapServices.map((secondSwapService) =>
                            makePossibleDoubleSwapInfo(
                                firstSwapService,
                                stableToken,
                                secondSwapService
                            )
                        );
                    })
                );

                return routes.flat();
            })
        );

        return allRoutes.flat();
    }

    async findSupportingSwapService(
        availableServices: AbstractSwapService[], 
        srcToken: Token, 
        possibleOutTokens: Token[],
    ): Promise<SupportingSwapServiceInfo[]> {
        const result = await Promise.all(
            availableServices.map(async (swapService) => {
                if (await this.doesSupportToken(swapService, srcToken)) {
                    const supportedSwapOutToken = possibleOutTokens.filter(async (dstToken) => {
                        await this.doesSupportToken(swapService, dstToken)
                    })
                    return {swapService, supportedSwapOutToken}
                }
            })
        );
        return compact(result)
    }

    private async doesSupportToken(availableService: AbstractSwapService, token: Token): Promise<boolean> {
        const supportedToken = await availableService.infoProvider.getSupportingToken(token.chain.id, token.address)
        return supportedToken === null
    }

    private async getSwapQuote(
        srcToken: Token,
        dstToken: Token,
        amount: string,
        slippagePercentStr: string,
        maxPriceImpact: number | null,
        swapService: AbstractSwapService,
    ): Promise<TokenAmount | null> {
        const swapRequest = new NaiveSameChainSwapQuoteRequest(
            srcToken.chain.id,
            srcToken.address,
            dstToken.address,
            amount,
            slippagePercentStr,
            maxPriceImpact,
        )
        return await swapService.getQuote(swapRequest)
    }

    private excludeVisitedSwapService(visited: AbstractSwapService): AbstractSwapService[]{
        return this.swapServices.filter((service) => 
            service.protocol !== visited.protocol
        ) ?? []
    }

} 
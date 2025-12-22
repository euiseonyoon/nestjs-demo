import { AbstractSwapService } from "src/application/swaps/provided_port/swap.interface";
import { Token } from "src/domain/token.class";
import { QuoteRoute } from "src/domain/x-swap.type";

export interface PossibleDoubleSwapInfo {
    readonly firstSwapService: AbstractSwapService,
    readonly stableToken: Token,
    readonly secondSwapService: AbstractSwapService,
}

export const makePossibleDoubleSwapInfo = (
    firstSwapService: AbstractSwapService,
    stableToken: Token,
    secondSwapService: AbstractSwapService,
): PossibleDoubleSwapInfo => {
    return {
        firstSwapService,
        stableToken,
        secondSwapService
    }
}

export interface SupportingSwapServiceInfo {
    readonly swapService: AbstractSwapService,
    readonly supportedSwapOutToken: Token[],
}

export interface IXSwapRouteSwapHelper {
    checkOneSwapRoute(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string,
        slippagePercentStr: string,
    ): Promise<QuoteRoute[]>

    checkDoubleSwapRoute(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string,
        slippagePercentStr: string,
    ): Promise<QuoteRoute[]>

    findPossibleDoubleSwapInfos(
        srcToken: Token,
        finalDstToken: Token,
    ): Promise<PossibleDoubleSwapInfo[]>

    findSupportingSwapService(
        availableServices: AbstractSwapService[],
        srcToken: Token,
        possibleOutTokens: Token[],
    ): Promise<SupportingSwapServiceInfo[]>
}

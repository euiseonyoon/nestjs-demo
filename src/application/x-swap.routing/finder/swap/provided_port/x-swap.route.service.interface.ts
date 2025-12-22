import { Token } from "src/domain/token.class";
import { QuoteRoute } from "src/domain/x-swap.type";

export interface IXSwapRouteService {
    findRoutes(
        srcToken: Token,
        dstToken: Token,
        srcAmount: string,
        slippagePercentStr: string,
    ): Promise<QuoteRoute[]>
}

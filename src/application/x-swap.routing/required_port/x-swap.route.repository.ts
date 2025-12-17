import { ProtocolInfo } from "src/domain/defi-type.enum";
import { Token } from "src/domain/token.class";
import { Route, RouteStep } from "src/domain/x-swap.type";

export interface IXSwapStepRepository<T, TReturn> {
    saveRoute (route: Route): Promise<void>
}

import { Route } from "src/domain/x-swap.type";

export interface IXSwapStepRepository {
    saveRoute (route: Route): Promise<void>
}

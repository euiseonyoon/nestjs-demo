import { QueryResult, RecordShape } from "neo4j-driver";
import { Route } from "src/domain/x-swap.type";

export interface INeo4JResultConverter {
    convertPathsToRoutes(result: QueryResult<RecordShape>, variableName: string): Route[]
}

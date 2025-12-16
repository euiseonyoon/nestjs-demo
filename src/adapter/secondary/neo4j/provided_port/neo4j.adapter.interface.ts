import { Session } from "neo4j-driver"

export interface INeo4JAdapterInterface {
    getSession(): Session 
    closeSession(): Promise<void> 
}

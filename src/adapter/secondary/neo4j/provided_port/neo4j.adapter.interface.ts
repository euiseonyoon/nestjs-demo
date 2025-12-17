import { Session } from "neo4j-driver"

export interface INeo4JAdapter {
    getSession(): Session 
    closeSession(): Promise<void> 
}

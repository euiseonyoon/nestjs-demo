import { Inject, Injectable, OnApplicationShutdown } from "@nestjs/common";
import { Driver, Session } from "neo4j-driver";
import { NEO4J_DRIVER_PROVIDER } from "src/infrastructure/infrastructure.token";
import { Neo4JDriverProvider } from "src/infrastructure/neo4j/neo4j.driver.provider";
import { INeo4JAdapter } from "./provided_port/neo4j.adapter.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Neo4JAdapter implements INeo4JAdapter, OnApplicationShutdown {
    readonly defaultDatabase = 'neo4j';
    private driver: Driver;
    private database: string; // 사용할 데이터베이스 이름 (선택적)

    constructor(
        @Inject(NEO4J_DRIVER_PROVIDER)
        private readonly neo4JDriverProvider: Neo4JDriverProvider,
        private readonly configService: ConfigService,
    ) {
        this.driver = this.neo4JDriverProvider.getDriver();
        this.database = this.configService.get<string>('NEO4J_DATABASE') ?? this.defaultDatabase;
    }

    async onApplicationShutdown(signal?: string) {
        await this.driver.close();
    }

    getSession(): Session {
        return this.driver.session({ database: this.database });
    }

    async closeSession(): Promise<void> {
        await this.driver.close();
    }
} 

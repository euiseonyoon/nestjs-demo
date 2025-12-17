import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { driver, auth, Driver } from 'neo4j-driver';

@Injectable()
export class Neo4JDriverProvider{
    private driver: Driver

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.driver = this.createDriver()
    }

    getDriver(): Driver {
        return this.driver
    }

    createDriver(): Driver {
        const uri = this.configService.get<string>('NEO4J_URI');
        const user = this.configService.get<string>('NEO4J_USERNAME');
        const password = this.configService.get<string>('NEO4J_PASSWORD');

        if (!uri || !user || !password) {
            throw Error("Can't find the config for Neo4J connection")
        }
        
        // 드라이버 인스턴스 생성
        const neo4jDriver = driver(uri, auth.basic(user, password));
        
        return neo4jDriver;
    }
}

import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { driver, auth, Driver } from 'neo4j-driver';

@Injectable()
export class Neo4JDriverProvider implements OnModuleInit{
    private driver: Driver | null

    constructor(
        private readonly configService: ConfigService,
    ) {}

    getDriver(): Driver | null {
        return this.driver
    }

    async onModuleInit() {
        const driver = await this.createDriver()
        this.driver = driver
    }

    async createDriver(): Promise<Driver | null> {
        const uri = this.configService.get<string>('NEO4J_URI');
        const user = this.configService.get<string>('NEO4J_USERNAME');
        const password = this.configService.get<string>('NEO4J_PASSWORD');

        if (!uri || !user || !password) {
            return null
        }
        
        // 드라이버 인스턴스 생성
        const neo4jDriver = driver(uri, auth.basic(user, password));
        
        // 연결 테스트
        await neo4jDriver.verifyConnectivity();
        console.log('Neo4j Connection Established.');
        
        return neo4jDriver;
    }
}

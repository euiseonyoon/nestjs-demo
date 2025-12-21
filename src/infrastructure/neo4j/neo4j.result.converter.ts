import { Injectable } from "@nestjs/common";
import { Path, Relationship, QueryResult, RecordShape, Node } from "neo4j-driver";
import { INeo4JResultConverter } from "src/adapter/secondary/x-swap.routing/required_port/neo4j.result.converter.interface";
import { ChainInfo } from "src/domain/chain-info.type";
import { bridgeProtocolFromString, getProtocolType, ProtocolInfo, ProtocolType, swapProtocolFromString } from "src/domain/defi-type.enum";
import { EvmAddress } from "src/domain/evm-address.class";
import { ChainNodeProperties, RelationshipProperties, TokenNodeProperties } from "src/domain/neo4jj.type";
import { Token } from "src/domain/token.class";
import { Route, RouteStep } from "src/domain/x-swap.type";

@Injectable()
export class Neo4JResultConverter implements INeo4JResultConverter {
    constructor(){}

    convertPathsToRoutes(result: QueryResult<RecordShape>, pathVairalbeName: string): Route[] {
        const routes: Route[] = [];
        
        for (const record of result.records) {
            try {
                const path = record.get(pathVairalbeName) as Path;
                const chains = record.get('chains') as Node[];

                if (!path?.segments?.length || !chains.length) {
                    console.log("swap라우트 찾기에서 경로 step이 없거나, chain info가 없는 경우 발생...");
                    continue;
                }

                const route = this.convertToRouteWithChains(path, chains)
                if (route) {
                    routes.push(route);
                }
            } catch(error) {
                console.log(`Error while converting to Routes. e={${error}}`)
                continue;
            }
        }

        return routes
    }

    private convertToRouteWithChains(neo4jPath: Path, chains: Node[]): Route | null {
        const steps: RouteStep[] = [];

        // checking:    chain(node) - relation(segment) - chain(node) - ... 체크 
        if (chains.length - neo4jPath.segments.length !== 1) {
            return null
        }

        for (let i = 0; i < neo4jPath.segments.length; i++) {
            const srcChainInfo = this.convertToChainInfo(chains[i]!);
            const dstChainInfo = this.convertToChainInfo(chains[i + 1]!);

            const segment = neo4jPath.segments[i]!;

            const srtToken = this.convertToToken(segment.start, srcChainInfo)
            const dstToken = this.convertToToken(segment.end, dstChainInfo)

            const protocolInfo = this.convertToProtocolInfo(segment.relationship)

            steps.push({
                srcToken: srtToken,
                dstToken: dstToken,
                protocolInfo,
            });
        }
        return { steps: steps } as Route
    }

    private convertToChainInfo(chainNode: Node): ChainInfo {
        const chainProps = chainNode.properties as ChainNodeProperties;
        this.validateChainProperties((chainProps))
        return this.chainPropsToChainInfo(chainProps)
    }

    private chainPropsToChainInfo(props: ChainNodeProperties): ChainInfo {
        return {
            id: props.chainId,
            name: props.name,
            testnet: props.testnet
        }
    }

    private convertToToken(tokenNode: Node, chainInfo: ChainInfo): Token {
        const tokenProps = tokenNode.properties as TokenNodeProperties;
        this.validateTokenProperties(tokenProps);
        return this.tokenPropsToToken(tokenProps, chainInfo);
    }

    private tokenPropsToToken(
        props: TokenNodeProperties,
        chainInfo: ChainInfo,
    ): Token {
        return new Token(
            chainInfo,
            new EvmAddress(props.address),
            props.symbol,
            props.decimals,
            props.name,
            props.logoUri,
            props.isNative,
        )
    }

    private convertToProtocolInfo(relationship: Relationship): ProtocolInfo {
        const relProps = relationship.properties as RelationshipProperties;
        this.validateRelationshipProperties(relProps);
        const protocolType = getProtocolType(relProps.protocolType)

        if(protocolType === ProtocolType.SWAP) {
            return {
                protocolType: ProtocolType.SWAP,
                protocolName: swapProtocolFromString(relProps.protocolName),
                version: relProps.version
            }
        } else {
            return {
                protocolType: ProtocolType.BRIDGE,
                protocolName: bridgeProtocolFromString(relProps.protocolName),
                version: relProps.version
            }
        }
    }


    private validateChainProperties(props: any): asserts props is ChainNodeProperties {
        if (
            typeof props.chainId !== 'number' ||
            typeof props.name !== 'string' ||
            typeof props.testnet !== 'boolean'
        ) {
            throw new Error('Invalid chain node properties');
        }
    }

    private validateTokenProperties(props: any): asserts props is TokenNodeProperties {
        if (
            typeof props.tokenId !== 'string' ||
            typeof props.address !== 'string' ||
            typeof props.symbol !== 'string' ||
            typeof props.chainId !== 'number' ||
            typeof props.decimals !== 'number' ||
            typeof props.name !== 'string' ||
            typeof props.isNative !== 'boolean' ||
            (props.logoUri !== undefined && typeof props.logoUri !== 'string')
        ) {
            throw new Error('Invalid token node properties');
        }
    }

    private validateRelationshipProperties(props: any): asserts props is RelationshipProperties {
        if (
            typeof props.protocolName !== 'string' ||
            typeof props.protocolType !== 'string' ||
            typeof props.protocolId !== 'string' ||
            typeof props.version !== 'string'
        ) {
            throw new Error('Invalid relationship properties');
        }
    }
}

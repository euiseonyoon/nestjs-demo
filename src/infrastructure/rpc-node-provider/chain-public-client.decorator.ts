import { SetMetadata, Type } from '@nestjs/common';
import { ChainPublicClients } from './chain-public-clients.interface';

export const CHAIN_PUBLIC_CLIENT_KEY = Symbol('CHAIN_PUBLIC_CLIENT');

// 구현체들을 저장할 배열
export const chainPublicClientClasses: Type<ChainPublicClients>[] = [];

// ChainPublicClients 인터페이스 구현 여부 검증

function isChainPublicClientsImpl(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    target: Function,
): target is Type<ChainPublicClients> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proto = target.prototype;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (
        proto &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof proto.createHttpPublicClients === 'function' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof proto.createWssPublicClients === 'function'
    );
}

// 데코레이터: 클래스를 등록
export function ChainPublicClient(): ClassDecorator {
    return (target) => {
        if (!isChainPublicClientsImpl(target)) {
            throw new Error(
                `@ChainPublicClient() can only be applied to classes implementing ChainPublicClients. ` +
                    `Class "${target.name}" does not implement required methods.`,
            );
        }

        chainPublicClientClasses.push(target);
        SetMetadata(CHAIN_PUBLIC_CLIENT_KEY, true)(target);
    };
}

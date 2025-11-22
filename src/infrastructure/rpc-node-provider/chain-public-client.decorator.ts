import { SetMetadata } from '@nestjs/common';

export const CHAIN_PUBLIC_CLIENT_KEY = 'CHAIN_PUBLIC_CLIENT';

// 구현체들을 저장할 배열
export const chainPublicClientClasses: any[] = [];

// 데코레이터: 클래스를 등록
export function ChainPublicClient(): ClassDecorator {
  return (target) => {
    chainPublicClientClasses.push(target);
    SetMetadata(CHAIN_PUBLIC_CLIENT_KEY, true)(target);
  };
}

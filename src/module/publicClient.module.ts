import { Module } from "@nestjs/common";
import { RpcClientManagerImpl } from "src/infrastructure/manager/rpcClientManager.implement";
import { BaseChainPublicClientsImpl } from "src/infrastructure/rpcNodeProvider/base.PublicClients";
import { chainPublicClientClasses } from "src/infrastructure/rpcNodeProvider/chainPublicClient.decorator";
import { ChainPublicClients } from "src/infrastructure/rpcNodeProvider/chainPublicClients.iterface";
import { EthereumChainPublicClientsImpl } from "src/infrastructure/rpcNodeProvider/ethereum.PublicClients";

/***
 * 
 * 방법 1: useFactory로 명시적 수집 (제가 이전에 제안한 방식)
  {
    provide: 'AllChainPublicClients',
    useFactory: (eth, base): ChainPublicClients[] => [eth, base],
    inject: [EthereumChainPublicClientsImpl, BaseChainPublicClientsImpl],
  }

  방법 2: 배열을 직접 제공
  {
    provide: 'AllChainPublicClients',
    useValue: [new EthereumChainPublicClientsImpl(), new BaseChainPublicClientsImpl()],
  }
 */
@Module({
  providers: [
    ...chainPublicClientClasses,  // 자동으로 모든 구현체 등록, 1) 먼저 provider로 등록
    {
      provide: 'AllChainPublicClients',
      useFactory: (...clients: ChainPublicClients[]) => clients,
      inject: chainPublicClientClasses, // 2) 그래야 여기서 주입 가능
    },
    { provide: 'RpcClientManager', useClass: RpcClientManagerImpl },
  ],
  exports: ['RpcClientManager'],
})
export class PublicClientModule {}

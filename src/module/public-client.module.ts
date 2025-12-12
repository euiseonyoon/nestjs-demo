import { Module } from '@nestjs/common';
import { RpcClientManager } from 'src/infrastructure/manager/rpc-client-manager.impl';
import { ChainPublicClients } from 'src/infrastructure/rpc-node-provider/chain-public-clients.interface';
import { ALL_CHAIN_PUBLIC_CLIENTS, RPC_CLIENT_MANAGER } from 'src/infrastructure/manager/rpc-client-manager.token';
import { chainPublicClientClasses } from 'src/infrastructure/rpc-node-provider/chain-public-client.decorator';
import 'src/infrastructure/rpc-node-provider/ethereum.public-clients';
import 'src/infrastructure/rpc-node-provider/base.public-clients';

@Module({
    providers: [
        ...chainPublicClientClasses, // 자동으로 모든 구현체 등록, 1) 먼저 provider로 등록
        {
            provide: ALL_CHAIN_PUBLIC_CLIENTS,
            inject: chainPublicClientClasses, // 2) 그래야 여기서 주입 가능
            useFactory: (...clients: ChainPublicClients[]) => clients, // clients는 imports에서 입력한것들
        },
        { provide: RPC_CLIENT_MANAGER, useClass: RpcClientManager },
    ],
    exports: [RPC_CLIENT_MANAGER],
})
export class PublicClientModule {}

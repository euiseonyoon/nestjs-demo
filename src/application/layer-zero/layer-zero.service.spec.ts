import { Test, TestingModule } from "@nestjs/testing";
import { LayerZeroService } from "./layer-zero.service";
import { TxModule } from "src/module/tx.module";
import { PublicClientModule } from "src/module/public-client.module";
import { HttpClientModule } from "src/module/http-client.module";
import 'src/infrastructure/rpc-node-provider/ethereum.public-clients';
import 'src/infrastructure/rpc-node-provider/base.public-clients';
import 'src/infrastructure/rpc-node-provider/bsc.public-clients';
import { bsc, mainnet } from "viem/chains";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";

describe('LayerZeroService (Integration Test)', () => {
    let layerZeroService: LayerZeroService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                HttpClientModule,
                TxModule,
                PublicClientModule
            ],
            providers: [
                LayerZeroService
            ],
        }).compile();

        await module.init(); // OnModuleInit 완료까지 대기
        layerZeroService = module.get<LayerZeroService>(LayerZeroService);
    });

    it('서비스 인스턴스 주입 및 정의 테스트', () => {
        expect(layerZeroService).toBeDefined();
    });

    it('convertEidToChainId() 테스트', () => {
        const eidAndChainId = [
            [30101, mainnet.id],
            [30102, bsc.id],
        ]
        eidAndChainId.forEach(([eid, expectedChainId]) => {
            const result = layerZeroService.convertEidToChainId(eid)
            expect(result).toEqual(expectedChainId)
        })
    });

    it('fetchBridgeInfo() 테스트', async() => {
        /**
         * Ethereum (USDT) - Stargate bridge -> Bsc (USDT)
         * srcTxHash : https://etherscan.io/tx/0x0ec695b4b562763305161362a3321b860b273d7880ea0584cf51154ec951e774
         * dstTxHash : https://bscscan.com/tx/0x5137e6e3658d5b1a9391fbb02a4f1ec4a03bf37491259b8d0375a4b9d2026217
         */
        // GIVEN 
        const srcTxHash = new EvmTxHash('0x0ec695b4b562763305161362a3321b860b273d7880ea0584cf51154ec951e774')

        // WHEN
        const result = await layerZeroService.fetchBridgeInfo(srcTxHash)

        // THEN
        expect(result).not.toBeNull()
    })

    it('getBridgeOutAmountFromReceipt() 테스트', async() => {
        /**
         * Ethereum (USDT) - Stargate bridge -> Bsc (USDT)
         * srcTxHash : https://etherscan.io/tx/0x0ec695b4b562763305161362a3321b860b273d7880ea0584cf51154ec951e774
         * dstTxHash : https://bscscan.com/tx/0x5137e6e3658d5b1a9391fbb02a4f1ec4a03bf37491259b8d0375a4b9d2026217
         */
        // GIVEN
        const bscEid = 30102
        const dstTxHash = new EvmTxHash('0x5137e6e3658d5b1a9391fbb02a4f1ec4a03bf37491259b8d0375a4b9d2026217')

        const txReceipt = await layerZeroService.getTxReceiptUsingDstInfo(bscEid, dstTxHash)
        expect(txReceipt).not.toBeNull()

        const amount = await layerZeroService.getBridgeOutAmountFromReceipt(txReceipt!)
        expect(amount).not.toBeNull()
        expect(amount).toBe(151980363000000000000n)
    })

    it('getBridgeOutAmountFromReceipt() 테스트2', async() => {
        /**
         * Ethereum (ETH) - Stargate bridge -> Base (Eth)
         * srcTxHash : https://etherscan.io/tx/0x76980a275dfcca189434a5fc76615c2223b50276a407eed69f27416aa2f7fdbd
         * dstTxHash : https://basescan.org/tx/0x64cb2954a54c3e218216c7ce81b96b3111f78646219f3b5b4b882b73766eb862
         */
        
        // GIVEN
        const baseEid = 30184
        const dstTxHash = new EvmTxHash('0x64cb2954a54c3e218216c7ce81b96b3111f78646219f3b5b4b882b73766eb862')

        const txReceipt = await layerZeroService.getTxReceiptUsingDstInfo(baseEid, dstTxHash)
        expect(txReceipt).not.toBeNull()

        const amount = await layerZeroService.getBridgeOutAmountFromReceipt(txReceipt!)
        expect(amount).not.toBeNull()
        expect(amount).toBe(2008848000000000000n)
    })
})

import { Test, TestingModule } from "@nestjs/testing";
import { PublicClientModule } from "src/module/public-client.module";
import { EvmTxHash } from "src/domain/evm-tx-hash.class";
import { TxService } from "src/application/transaction/tx.service";

describe('TxService (Integration test)', ()=>{
    let txService: TxService;
    const dummyEvmTxHash = new EvmTxHash('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ PublicClientModule ],
            providers: [ 
                TxService,
            ],
        }).compile();

        txService = module.get<TxService>(TxService);
    });

    it('정상 작동 테스트', async () => {
        // GIVEN
        const ethereumChainId = 1;
        const ethTxHash = new EvmTxHash('0x65ea2da89f1fdc2beb32afc76ea100fec1cb2759edfa375ba474c62086c5dbd0')

        // WHEN & THEN
        const result = await txService.getTxReceipt(ethTxHash, ethereumChainId);
        expect(result).not.toBeNull()
        expect(result?.transactionHash.toLowerCase()).toEqual(ethTxHash.hash.toLowerCase())
    });
})
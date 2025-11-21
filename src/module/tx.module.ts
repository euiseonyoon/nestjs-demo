import { Module } from "@nestjs/common";
import { TxController } from "src/adapter/primary/transaction/tx.controller";
import { TxServiceImpl } from "src/application/transaction/tx.service";

@Module({
  imports: [],
  controllers: [TxController],
  providers: [
    { provide: 'TxService', useClass: TxServiceImpl }
]
})
export class TxModule {}

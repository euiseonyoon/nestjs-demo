import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
// interface는 런타임에 존재하지 않으므로 import type을 사용해야함.
import type { TxService } from 'src/application/transaction/provided_port/tx.interface';
import { Hash, TransactionReceipt } from 'viem';

@Controller('tx')
export class TxController {
  constructor(
    @Inject('TxService')
    private readonly txService: TxService,
  ) {}

  // /tx/receipt?txHash=0x...&chainId=1
  @Get('receipt')
  async getTxReceipt(
    @Query('txHash') txHash: string,
    @Query('chainId', ParseIntPipe) chainId: number, // ParseIntPipe: string -> number로 변경
  ): Promise<TransactionReceipt> {
    if (!txHash.startsWith('0x')) {
      throw new BadRequestException('Invalid tx hash format');
    }

    return this.txService.getTxReceipt(txHash as Hash, chainId);
  }
}

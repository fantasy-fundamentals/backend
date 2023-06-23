import { Module } from '@nestjs/common';
import { TransactionLogController } from './transactionLog.controller';
import { TransactionLogService } from './transactionLog.service';

@Module({
  controllers: [TransactionLogController],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
})
export class TransactionLogModule {}

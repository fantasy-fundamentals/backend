import { Module } from '@nestjs/common';
import { BurnRequestController } from './burn-request.controller';
import { BurnRequestService } from './burn-request.service';

@Module({
  controllers: [BurnRequestController],
  providers: [BurnRequestService],
  exports: [BurnRequestService],
})
export class BurnRequestModule {}

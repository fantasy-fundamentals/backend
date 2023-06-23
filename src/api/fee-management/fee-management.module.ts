import { Module } from '@nestjs/common';
import { FeeManagementController } from './fee-management.controller';
import { FeeManagementService } from './fee-management.service';

@Module({
  controllers: [FeeManagementController],
  providers: [FeeManagementService]
})
export class FeeManagementModule { }

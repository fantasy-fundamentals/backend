import { Module } from '@nestjs/common';
import { AdminImportController } from './admin-import.controller';
import { AdminImportService } from './admin-import.service';

@Module({
  providers: [AdminImportService],
  controllers: [AdminImportController],
})
export class AdminImportModule {}

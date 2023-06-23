import { Module } from '@nestjs/common';
import { ResponseService } from 'src/utils/response/response.service';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  controllers: [KycController],
  providers: [KycService, ResponseService],
})
export class KycModule {}

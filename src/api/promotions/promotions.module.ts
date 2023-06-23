import { Module } from '@nestjs/common';
import { ResponseService } from 'src/utils/response/response.service';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService, ResponseService],
})
export class PromotionsManagementModule {}

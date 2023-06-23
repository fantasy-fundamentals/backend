import { Module } from '@nestjs/common';
import { EmailPromotionController } from './emailPromotion.controller';
import { EmailPromotionService } from './emailPromotion.service';

@Module({
  controllers: [EmailPromotionController],
  providers: [EmailPromotionService],
})
export class EmailPromotionModule {}

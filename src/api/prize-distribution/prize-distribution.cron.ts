import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrizeDistributionService } from './prize-distribution.service';
@Injectable()
export class NftRatesCron {
  constructor(private prizeDistributionService: PrizeDistributionService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async syncRanking() {
    console.log('Prize distribution weekly crone running...');
    // await this.prizeDistributionService.distribution();
    return void 0;
  }
}

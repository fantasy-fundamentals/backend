import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScoreService } from './score.service';

@Injectable()
export class ScoreCron {
  constructor(private scoreService: ScoreService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sync() {
    console.log('Score sync cron is running...');
    await this.scoreService.sync();
    return;
  }
}

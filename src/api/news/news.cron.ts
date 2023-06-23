import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewsService } from './news.service';

@Injectable()
export class NewsCron {
  constructor(private newsService: NewsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sync() {
    console.log('News sync cron is running...');
    await this.newsService.sync();
    return;
  }
}

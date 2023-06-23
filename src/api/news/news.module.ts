import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsCron } from './news.cron';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsCron],
})
export class NewsModule {}

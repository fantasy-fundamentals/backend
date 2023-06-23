import { Module } from '@nestjs/common';
import { ProjectArticleController } from './projectArticle.controller';
import { ProjectArticleService } from './projectArticle.service';

@Module({
  controllers: [ProjectArticleController],
  providers: [ProjectArticleService],
})
export class ProjectArticleModule {}

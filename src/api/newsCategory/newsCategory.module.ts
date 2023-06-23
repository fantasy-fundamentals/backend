import { Module } from '@nestjs/common';
import { NewsCategoryController } from './newsCategory.controller';
import { NewsCategoryService } from './newsCategory.service';

@Module({
  controllers: [NewsCategoryController],
  providers: [NewsCategoryService],
})
export class NewsCategoryModule {}

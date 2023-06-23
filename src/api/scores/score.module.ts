import { Module } from '@nestjs/common';
import { ScoreController } from './score.controller';
import { ScoreCron } from './score.cron';
import { ScoreService } from './score.service';

@Module({
  controllers: [ScoreController],
  providers: [ScoreService, ScoreCron],
})
export class ScoreModule {}

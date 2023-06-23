import { Module } from '@nestjs/common';
import { GameLogController } from './gameLog.controller';
import { GameLogService } from './gameLog.service';

@Module({
  controllers: [GameLogController],
  providers: [GameLogService],
})
export class GameLogModule {}

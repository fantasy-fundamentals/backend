import { Module } from '@nestjs/common';
import { PositionController } from './positions.controller';
import { PositionService } from './positions.service';

@Module({
  controllers: [PositionController],
  providers: [PositionService],
})
export class PositionModule {}

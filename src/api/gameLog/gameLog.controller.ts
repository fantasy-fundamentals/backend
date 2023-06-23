import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameLogService } from './gameLog.service';

@ApiTags('Game logs')
@Controller('game-logs')
export class GameLogController {
  constructor(private gameLogService: GameLogService) {}

  @ApiOperation({ summary: 'Admin get all game logs' })
  @Get('/')
  async adminGetAll() {
    return await this.gameLogService.adminGetAll();
  }
}

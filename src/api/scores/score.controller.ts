import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterScoreWithPaginationDto } from './dto/filter-score.dto';
import { ScoreService } from './score.service';

@ApiTags('Score Management')
@Controller('scores')
export class ScoreController {
  constructor(private scoreService: ScoreService) {}

  @ApiOperation({ summary: 'Sync scores data' })
  @Get('/sync')
  async get() {
    return await this.scoreService.sync();
  }

  @ApiOperation({ summary: 'Sync scores data' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'upcoming', required: true, type: Boolean })
  @Get('/')
  async getScores(@Query() query: FilterScoreWithPaginationDto) {
    return await this.scoreService.getScores(query);
  }

  @ApiOperation({ summary: 'Get nfl current week' })
  @Get('/current-week')
  async getCurrentWeek() {
    return await this.scoreService.getCurrentWeek();
  }
}

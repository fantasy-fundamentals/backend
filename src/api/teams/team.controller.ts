import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';

@ApiTags('Teams Management')
@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @ApiOperation({ summary: 'Sync teams data' })
  @Get('/sync')
  async get() {
    return await this.teamService.sync();
  }

  @ApiOperation({ summary: 'Get teams data' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @Get('/')
  async getTeams(@Query() query) {
    return await this.teamService.getTeams(query);
  }
}

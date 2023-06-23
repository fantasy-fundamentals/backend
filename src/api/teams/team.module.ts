import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamCron } from './team.cron';
import { TeamService } from './team.service';

@Module({
  controllers: [TeamController],
  providers: [TeamService, TeamCron],
})
export class TeamModule {}

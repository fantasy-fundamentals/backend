import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TeamService } from './team.service';

@Injectable()
export class TeamCron {
  constructor(private teamService: TeamService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sync() {
    console.log('Teams sync cron is running...');
    await this.teamService.sync();
    return;
  }
}

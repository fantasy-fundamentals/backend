import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerService } from './player.service';
@Injectable()
export class PlayerCron {
  constructor(private playerService: PlayerService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sync() {
    console.log('Players sync cron is running...');
    await this.playerService.sync();
    return;
  }
}

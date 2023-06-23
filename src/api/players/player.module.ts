import { Module } from '@nestjs/common';
import { NftModule } from '../nft/nft.module';
import { PlayerController } from './player.controller';
import { PlayerCron } from './player.cron';
import { PlayerService } from './player.service';
@Module({
  imports: [NftModule],
  controllers: [PlayerController],
  providers: [PlayerService, PlayerCron],
  exports: [PlayerService]
})
export class PlayerModule { }

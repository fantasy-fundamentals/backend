import { Module } from '@nestjs/common';
import { PlayerFavoriteController } from './player-favorite.controller';
import { PlayerFavoriteService } from './player-favorite.service';

@Module({
  controllers: [PlayerFavoriteController],
  providers: [PlayerFavoriteService],
})
export class PlayerFavoriteModule {}

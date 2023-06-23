import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerFavoriteService } from './player-favorite.service';

@ApiTags('Player favorite')
@Controller('player-favorite')
export class PlayerFavoriteController {
  constructor(private playerFavoriteService: PlayerFavoriteService) {}

  @ApiOperation({ summary: 'get favorite players' })
  @ApiParam({ name: 'email' })
  @Get('/:email')
  async get(@Param() { email }) {
    return await this.playerFavoriteService.get(email);
  }

  @ApiOperation({ summary: 'Add to favorite' })
  @ApiParam({ name: 'email' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'favorite' })
  @Get('/:id/:email/:favorite')
  async favorite(@Param() { id, email, favorite }) {
    return await this.playerFavoriteService.favorite(id, email, favorite);
  }
}

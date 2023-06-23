import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterPlayerWithPaginationDto } from './models/filter-player.dto';
import { PlayerService } from './player.service';
import { PlayerValueDto } from './models/player-value.dto';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { PlayerStatus } from './models/player-stauts.enum';
import { AdminAuthGuard } from 'src/decorators/admin.guard';
import { IsMongoId } from 'class-validator';

@ApiTags('Players Management')
@Controller('players')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Sync players data' })
  @Get('/sync')
  async get() {
    return await this.playerService.sync();
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Get all saved players' })
  // @ApiQuery({ type: String, name: 'firstName', required: false })
  // @ApiQuery({ type: String, name: 'lastName', required: false })
  // @ApiQuery({ type: Boolean, name: 'status', required: false })
  // @ApiQuery({ type: Number, name: 'playerId', required: false })
  // @ApiQuery({ type: Number, name: 'page', required: false })
  // @ApiQuery({ type: Number, name: 'limit', required: false })
  // @Get('/list-for-authenticated')
  // async listPlayersForAuthenticatedUser(
  //   @Query() query: FilterPlayerWithPaginationDto,
  //   @AuthenticatedUser() user
  // ) {
  //   return await this.playerService.listAllForAuthenticatedUser(
  //     user.email,
  //     query
  //   );
  // }

  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Add/Update NFT value of the player' })
  @Put('/:playerId/update-value')
  async addPlayerValue(
    @Param('playerId', ValidateMongoId) id: string,
    @Body() body: PlayerValueDto,
  ) {
    return await this.playerService.updateValue(id, body);
  }

  @ApiOperation({ summary: 'Get all saved players' })
  @ApiQuery({ type: String, name: 'firstName', required: false })
  @ApiQuery({ type: String, name: 'lastName', required: false })
  @ApiQuery({
    type: String,
    name: 'status',
    required: false,
    enum: PlayerStatus,
  })
  @ApiQuery({ type: Number, name: 'playerId', required: false })
  @ApiQuery({ type: Number, name: 'page', required: false })
  @ApiQuery({ type: Number, name: 'limit', required: false })
  @ApiQuery({ type: String, name: 'team', required: true })
  @Get('/')
  async listPlayers(@Query() query: FilterPlayerWithPaginationDto) {
    return await this.playerService.listAll(query);
  }

  @ApiOperation({ summary: 'Get single player details' })
  @Get('/:playerId/details')
  async getSinglePlayerDetails(@Param('playerId') playerId: number) {
    return await this.playerService.getSinglePlayerDetails(playerId);
  }

  @ApiOperation({ summary: 'Get players by rating' })
  @ApiQuery({ type: Number, name: 'page', required: false })
  @ApiQuery({ type: Number, name: 'limit', required: false })
  @ApiQuery({ type: String, name: 'team', required: true })
  @Get('/players-by-rating')
  async playersByRating(@Query() query) {
    return await this.playerService.playersByRating(query);
  }
}

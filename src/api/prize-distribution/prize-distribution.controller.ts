import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Position } from 'src/utils/misc/enum';
import { PrizeDistributionService } from './prize-distribution.service';

@ApiTags('Prize Distribution')
@Controller('prize-distribution')
export class PrizeDistributionController {
  constructor(private prizeDistributionService: PrizeDistributionService) {}

  // @ApiOperation({ summary: 'Sync prize distribution' })
  // @Get('/')
  // async get() {
  //   return await this.prizeDistributionService.distributePrizeQB();
  // }

  @ApiOperation({ summary: 'Sync prize distribution QB' })
  @Get('/syncTempRatingQB')
  async syncRatingQB() {
    return await this.prizeDistributionService.distributionQB();
  }

  @ApiOperation({ summary: 'Sync prize distribution RB' })
  @Get('/syncTempRatingRB')
  async syncRatingRB() {
    return await this.prizeDistributionService.distributionRB();
  }

  @ApiOperation({ summary: 'Sync prize distribution TE' })
  @Get('/syncTempRatingTE')
  async syncRatingTE() {
    return await this.prizeDistributionService.distributionTE();
  }

  @ApiOperation({ summary: 'Sync prize distribution WR' })
  @Get('/syncTempRatingWR')
  async syncRatingWR() {
    return await this.prizeDistributionService.distributionWR();
  }

  @ApiOperation({ summary: 'Sync prize distribution' })
  @Get('/syncTempRating/:position/:week')
  async syncRating(@Param('position') position: Position, @Param('week') week: number) {
     this.prizeDistributionService.syncRanking(position, week);
     return {
        status: 201,
        message:"Sync job is running!"
     }
  }

}

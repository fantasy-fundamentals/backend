import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WatchListService } from './watchList.service';
import { WatchListDto } from './dto/watchListDto.dto';

@ApiTags('Watchlist management')
@Controller('watchlist')
export class WatchListController {
  constructor(private watchListService: WatchListService) {}

  @ApiOperation({ summary: 'Add news category' })
  @Post('/')
  async create(@Body() payload: WatchListDto) {
    return await this.watchListService.create(payload);
  }

  @ApiOperation({ summary: 'Get all using walletAddress' })
  @ApiParam({ name: 'walletAddress' })
  @Get('/:walletAddress')
  async get(@Param() { walletAddress }) {
    return await this.watchListService.get(walletAddress);
  }

  @ApiOperation({ summary: 'Update' })
  @Put('/')
  async update(@Body() payload: WatchListDto) {
    return await this.watchListService.update(payload);
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete('/:id')
  async delete(@Body() payload: WatchListDto) {
    return await this.watchListService.delete(payload);
  }
}

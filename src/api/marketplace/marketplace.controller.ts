import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceDto } from './dto/marketplace.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @ApiOperation({ summary: 'Add marketplace entity' })
  @Post('/')
  async create(@Body() promote: MarketplaceDto) {
    return await this.marketplaceService.create(promote);
  }

  @ApiOperation({ summary: 'get all entities by admin' })
  @Get('/admin')
  async getAdminCoin() {
    return await this.marketplaceService.getAllAdmin();
  }
}

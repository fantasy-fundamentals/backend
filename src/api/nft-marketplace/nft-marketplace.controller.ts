import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NFTMarketplaceService } from './nft-marketplace.service';
import { CreateNFTMarketplaceEntityDTO } from './model/create-nft-marketplace-entity.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';

@ApiTags('NFT Marketplace')
@Controller('nft-marketplace')
export class NFTMarketplaceController {
  constructor(private nftMarketplaceService: NFTMarketplaceService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new entity' })
  @Post('/')
  async create(@Body() body: CreateNFTMarketplaceEntityDTO) {
    return await this.nftMarketplaceService.create(body);
  }

  @ApiOperation({ summary: 'Get all saved entities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @Get('/')
  async listAll(@Query() query: PaginationDto) {
    return await this.nftMarketplaceService.listAll(query);
  }
}

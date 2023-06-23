import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NftDto } from './dto/nft-whitelist.dto';
import { NftWhitelistService } from './nft-whitelist.service';

@ApiTags('Nft Whitelists')
@Controller('nft-whitelist')
export class NftWhitelistController {
  constructor(private nftWhitelistService: NftWhitelistService) {}

  @ApiOperation({ summary: 'Add Nft Whitelist' })
  @Post('/')
  async create(@Body() kyc: NftDto) {
    return await this.nftWhitelistService.create(kyc);
  }

  @ApiOperation({ summary: 'Get Nfts' })
  @Get('/')
  async get() {
    return await this.nftWhitelistService.get();
  }
}

import { Get, Controller, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';
import { MintedNftBiddingService } from './mintednft-bidding.service';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';

@ApiTags('Minted NFT Bidding')
@Controller('mintednft-bidding')
export class MintedNftBiddingController {
  constructor(
    private readonly mintedNftBiddingService: MintedNftBiddingService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get bid detail',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/:bidId')
  async details(@Param('bidId', ValidateMongoId) bidId: string) {
    return await this.mintedNftBiddingService.findById(bidId);
  }
}

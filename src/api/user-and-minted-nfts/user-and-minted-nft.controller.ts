import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/shared/decorators/authenticated-user.decorator';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { CreateMintedNftBiddingDTO } from './models/create-minted-nft-bidding.dto';
import { UserAndMintedNftService } from './user-and-minted-nft.service';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { BurnNftDTO } from '../nft/models/update-nft.dto';

@ApiTags('Minted Nft')
@Controller('minted-nft')
export class UserAndMintedNftController {
  constructor(private userAndMintedNftService: UserAndMintedNftService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new bidding for a particular minted nft' })
  @Post('/:mintedNftId/bidding/new')
  async createBidForMintedNft(
    @Body() body: CreateMintedNftBiddingDTO,
    @Param('mintedNftId', ValidateMongoId) mintedNftId: string,
    @AuthenticatedUser() user: any,
  ) {
    return await this.userAndMintedNftService.createBid(
      body,
      mintedNftId,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept bidding made for a particular minted nft' })
  @Post('/:mintedNftId/bidding/:bidId/accept')
  async acceptBidForMintedNft(
    @Param('mintedNftId', ValidateMongoId) mintedNftId: string,
    @Param('bidId', ValidateMongoId) bidId: string,
    @AuthenticatedUser() user: any,
  ) {
    return await this.userAndMintedNftService.acceptBid(
      mintedNftId,
      bidId,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:mintedNftId/details')
  async getDetailsOfMintedNft(
    @Param('mintedNftId', ValidateMongoId) mintedNftId: string,
    @AuthenticatedUser() user: any,
  ) {
    return await this.userAndMintedNftService.getDetail(mintedNftId, user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/is-minted/:nftId')
  async isMinted(@Param('nftId', ValidateMongoId) nftId: string) {
    return await this.userAndMintedNftService.isMinted(nftId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/listAll/me')
  async listAllNftsMintedByLoggedInUser(
    @AuthenticatedUser() user: any,
    @Query() query: PaginationDto,
  ) {
    return this.userAndMintedNftService.listAllNftsMintedByLoggedInUser(
      user,
      query,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/:mintedNftId/toggle-market-activeplace/:quantity/:listingPrice')
  async toggleMarketActivePlaceFlag(
    @Param('mintedNftId', ValidateMongoId) mintedNftId: string,
    @AuthenticatedUser() user: any,
    @Param('quantity') quantity: string,
    @Param('listingPrice') listingPrice: string,
  ) {
    return this.userAndMintedNftService.toggleActiveMarketplaceFlag(
      user,
      mintedNftId,
      quantity,
      listingPrice,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Burn Nfts' })
  @Get('/burn/:nftId')
  async burn(@Param('nftId', ValidateMongoId) nftId: string, @AuthenticatedUser() user: any) {
    return await this.userAndMintedNftService.burn(nftId, user);
  }
}

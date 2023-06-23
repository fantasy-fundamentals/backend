import {
  Get,
  Controller,
  Query,
  Req,
  UseGuards,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  Res,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { NftService } from './nft.service';
import {
  FilterNftWithPaginationDto,
  FilterNftForAdminWithPaginationDto,
} from './models/filter-nft.dto';
import { PublicOrAuthenticatedRequest } from 'src/shared/middlewares/detect-guest-or-authenticated-user.middleware';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import {
  BurnNftDTO,
  NftOwnershipTransferDto,
  UpdateNftDTO,
} from './models/update-nft.dto';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { AuthenticatedUser } from 'src/shared/decorators/authenticated-user.decorator';

@ApiTags('Nft')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @ApiOperation({ summary: 'list all NFTs' })
  @Get('/')
  async listAll(
    @Query() query: FilterNftWithPaginationDto,
    @Req() req: PublicOrAuthenticatedRequest,
  ) {
    if (req.isGuestUser === true) {
      return await this.nftService.listForGuestUser(query);
    } else {
      return await this.nftService.listAllForAuthenticatedUser(query, req.user);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'list all NFTs for Admin' })
  @Get('/list-all-for-admin')
  async listAllForAdmin(@Query() query: FilterNftForAdminWithPaginationDto) {
    return await this.nftService.listAllForAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Update an exisiting Nft' })
  @Put('/:nftId')
  async update(
    @Body() payload: UpdateNftDTO,
    @Param('nftId', ValidateMongoId) nftId: string,
  ) {
    return await this.nftService.update(nftId, payload);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Claim back nfts' })
  @ApiParam({ name: 'nftId' })
  @ApiParam({ name: 'walletAddress' })
  @Get('/claim-back/:nftId/:walletAddress')
  async claimBack(
    @Param() { nftId, walletAddress },
    @AuthenticatedUser() user: any,
  ) {
    return await this.nftService.claimBack(nftId, walletAddress);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':walletAddress/get-all-minted-nfts-value')
  async getAllMintedNftsValue(@Param('walletAddress') walletAddress: string) {
    return await this.nftService.getAllMintedNftsValue(walletAddress);
  }

  @ApiOperation({ summary: 'Start importing nft videos' })
  @Get('/import-nft-videos')
  async import() {
    return await this.nftService.import();
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Transfer nft ownership after payment to owner' })
  @Post('/nft-ownership-transfer')
  async transferOwnership(
    @Body() payload: NftOwnershipTransferDto,
    @AuthenticatedUser() user: any,
  ) {
    return await this.nftService.transferByOwnerToBuyer(payload, user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Transfer nft ownership after payment to owner on instant payment',
  })
  @Post('/nft-ownership-transfer-instant')
  async transferOwnershipInstant(
    @Body() payload: NftOwnershipTransferDto,
    @AuthenticatedUser() user: any,
  ) {
    return await this.nftService.transferByOwnerToBuyerInstant(payload, user);
  }
}

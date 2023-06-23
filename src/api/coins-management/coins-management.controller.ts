import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/decorators/admin.guard';
import { CoinManagemnetEntity } from 'src/database/entities/coin-managemnet.entity';
import { CoinsManagementService } from './coins-management.service';
import {
  BlockCoinDto,
  CoinsManagementDto,
  DeployCoinContractDto,
  ValidateContractOwnershipDto,
} from './dto/coin-management.dto';
import { Express } from 'express';
import { ApproveCoinDto } from './dto/approve-coin.dto';
import { Coin } from 'src/database/entities/coins.entity';
import { COIN_LIST_FILTER } from 'src/utils/misc/enum';
import { MongoExceptionFilter } from 'src/utils/validation-error.filter';
type File = Express.Multer.File;

@ApiTags('Coin Management')
// @UseGuards(AdminAuthGuard)
@Controller('coins-management')
export class CoinsManagementController {
  constructor(private coinService: CoinsManagementService) {}

  @ApiOperation({ summary: 'Add Coin' })
  @UseFilters(MongoExceptionFilter)
  @Post('/add-coin')
  async addCoin(@Body() coin: CoinsManagementDto): Promise<Object> {
    return await this.coinService.addCoin(coin);
  }

  @ApiOperation({ summary: 'Get all Coin' })
  @ApiQuery({ name: COIN_LIST_FILTER.todaysHot })
  @ApiQuery({ name: COIN_LIST_FILTER.launchDate })
  @ApiQuery({ name: COIN_LIST_FILTER.marketCap })
  @ApiQuery({ name: COIN_LIST_FILTER.walletAddress })
  @Get('/get-all-coins')
  async getCoins(@Query() query) {
    return await this.coinService.getAllCoin(query);
  }

  @ApiOperation({ summary: 'Get all Coin admin' })
  @Get('/get-all-coins-admin')
  async getCoinAdmin() {
    return await this.coinService.getAllCoinAdmin();
  }

  @ApiOperation({ summary: 'Get all contract coins' })
  @Get('/get-all-contract-coins')
  async getAllContractCoins() {
    return await this.coinService.getAllContractCoins();
  }

  @ApiOperation({ summary: 'Get all Coins user' })
  @Get('/get-all-coins-user/:userAddress/:watchlist')
  async getCoinUser(
    @Param('userAddress') userAddress: string,
    @Param('watchlist') watchlist: string,
  ) {
    return await this.coinService.getAllCoinUser(userAddress, watchlist);
  }

  @ApiOperation({ summary: 'Get all Coins user' })
  @Get('/get-user-coin/:coinSymbol')
  async getCoin(@Param('coinSymbol') coinSymbol: string) {
    return await this.coinService.getUserCoin(coinSymbol);
  }

  @ApiOperation({ summary: 'Update coin' })
  @Put('update-coin/:coinId')
  async updateCoin(@Param('coinId') coinId: string, @Body() coin: any) {
    return await this.coinService.updateCoin(coinId, coin);
  }

  @ApiOperation({ summary: 'Approve coin' })
  @Post('/approve-coin')
  async approveCoin(@Body() approveCoin: ApproveCoinDto): Promise<object> {
    return this.coinService.approveCoin(approveCoin);
  }

  @ApiOperation({ summary: 'Deploy coin contract' })
  @Post('/deploy-contract')
  async deployCoinContract(
    @Body() payload: DeployCoinContractDto,
  ): Promise<object> {
    return this.coinService.deployCoinContract(payload);
  }

  @ApiOperation({ summary: 'Delete coin' })
  @Delete('delete-coin/:coinId')
  async deletCoin(@Param('coinId') coinId: string) {
    return await this.coinService.deleteCoin(coinId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: File) {
    return 'file uploaded...';
  }

  @ApiOperation({ summary: 'Validate contract ownership' })
  @Post('/validate-contract-ownership')
  async validateContractOwnership(
    @Body() payload: ValidateContractOwnershipDto,
  ) {
    return await this.coinService.validateContractOwnership(payload);
  }

  @ApiOperation({ summary: 'Block coin' })
  @Post('/block')
  async block(@Body() blockCoin: BlockCoinDto): Promise<object> {
    return this.coinService.block(blockCoin);
  }

  @ApiOperation({ summary: 'Update balance' })
  @ApiParam({ name: 'coinSymbol' })
  @ApiParam({ name: 'amount' })
  @Get('/update-balance/:coinSymbol/:amount')
  async updateBalance(@Param() { coinSymbol, amount }) {
    return await this.coinService.updateBalance(coinSymbol, +amount);
  }
}

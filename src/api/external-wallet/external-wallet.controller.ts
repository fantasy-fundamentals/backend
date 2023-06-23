import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExternalWalletDto } from './dto/externalWallet.dto';
import { ExternalWalletService } from './external-wallet.service';

@ApiTags('External Wallets')
@Controller('external-wallet')
export class ExternalWalletController {
  constructor(private readonly externalWalletService: ExternalWalletService) {}

  @Get('/')
  async get() {
    return await this.externalWalletService.get();
  }

  @Post('/')
  async create(@Body() { wallets }: ExternalWalletDto) {
    return await this.externalWalletService.create(wallets);
  }
}

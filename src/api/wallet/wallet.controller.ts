import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwt2FaAuthGuard } from 'src/api/admin-auth/strategy/admin-jwt-2fa.guard';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { Role } from 'src/api/auth/enums/role.enum';
import { Jwt2FaAuthGuard } from 'src/api/auth/strategy/jwt-2fa.guard';
import { RolesGuard } from 'src/api/auth/strategy/roles.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
@ApiTags('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Get('/get')
  async getUserWallets(@Req() { user }) {
    return await this.walletService.getUserWallets(user);
  }
}

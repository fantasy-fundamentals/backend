import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpCode,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminJwtAuthGuard } from '../admin-auth/strategy/admin.jwt.guard';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { TwoFaService } from './two-fa.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwoFaCodeDto } from './dto/two-fa-code.dto';
import { AuthService } from '../auth/auth.service';
import { EmailHandlerService } from '../email-handler/email-handler.service';
import { Jwt2FaAuthGuard } from '../auth/strategy/jwt-2fa.guard';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';

@ApiTags('2fa')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFaController {
  constructor(
    private readonly twoFaService: TwoFaService,
    private readonly authService: AuthService,
    private readonly emailHandlerService: EmailHandlerService
  ) { }

  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @Post('generate')
  async register(@Req() req) {
    const { secret } = await this.twoFaService.generateTwoFaSecret(req.user);
    try {
      const message = await this.emailHandlerService.send2FaVerificationEmail({
        to: req.user.email,
        name: req.user.name,
        secret
      })
      return {
        message: '2FA sent successfully'
      }
    } catch (e) {
      return {
        message: 'error'
      }
    }
  }

  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('enable')
  async turnOnTwoFactorAuthentication(
    @Req() request,
    @Body() { twoFaCode }: TwoFaCodeDto,
  ) {
    const isCodeValid = await this.twoFaService.isTwoFaCodeValid(
      twoFaCode,
      request.user.id,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const user = await this.twoFaService.enableTwoFa(request.user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isTwoFactorEnabled: user.isTwoFaEnabled,
    };
  }

  @ApiBearerAuth()
  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(AdminJwtAuthGuard)
  async authenticate(@Req() request, @Body() { twoFaCode }: TwoFaCodeDto) {
    const isCodeValid = await this.twoFaService.isTwoFaCodeValid(
      twoFaCode,
      request.user._id
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const generateAccessTokenPromise = this.authService.getJwtToken(
      request.user,
      true,
    );
    const resetTwoFaSecretPromise = this.twoFaService.resetTwoFaSecret(
      request.user,
    );

    const [accessToken, resetTwoFaResponse] = await Promise.all([
      generateAccessTokenPromise,
      resetTwoFaSecretPromise,
    ]);

    if (accessToken && resetTwoFaResponse) {
      return {
        accessToken,
        user: {
          _id: request.user._id.toString(),
          email: request.user.email,
          name: request.user.name,
          isBlocked: request.user.isBlocked,
          adminPermissions: request.user.adminPermissions,
          role: request.user.role
        }
      };
    }
  }
}
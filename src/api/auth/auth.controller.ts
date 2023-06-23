import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import * as path from 'path';
import { Response } from 'express';
import { AdminJwt2FaAuthGuard } from 'src/api/admin-auth/strategy/admin-jwt-2fa.guard';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { Jwt2FaAuthGuard } from './strategy/jwt-2fa.guard';
import { JwtAuthGuard } from './strategy/jwt.guard';
const { dirname } = require('path');
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    description: 'User Registration',
  })
  @Post('/register')
  register(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.register(authCredentialsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('/admin-create-user')
  adminUserRegistration(@Body() authCredentialsDto: AuthCredentialsDto) {
    let params = { ...authCredentialsDto, sdira: true };
    return this.authService.register(params);
  }

  @Post('/login')
  login(
    @Body() loginCredentialsDto: LoginCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginCredentialsDto);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/change-password')
  async changePassword(@Body() body: ChangePasswordDto, @Req() { user }) {
    return this.authService.changePassword(
      user.id,
      body.newPassword,
      body.oldPassword,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/verify-jwt')
  verifyJwt() {
    return {
      jwtVerified: true,
    };
  }

  @Post('/forgot-password')
  forgotPassword(@Body() ForgotPasswordParams: ForgotPasswordDto) {
    return this.authService.forgotPassword(ForgotPasswordParams);
  }

  @Post('/verify-pin')
  verifyPin(@Body() verifyPinParams: VerifyPinDto) {
    return this.authService.verifyPasswordResetPin(verifyPinParams);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/create-new-password')
  createNewPassword(
    @Body() newPasswordParams: NewPasswordDto,
    @Req() { user },
  ) {
    return this.authService.createNewPassword(newPasswordParams, user);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @ApiParam({ name: 'userId' })
  @Get('/block/:userId')
  async block(@Param('userId') userId) {
    return this.authService.blockUser(userId);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/admin/change-password')
  async adminChangePassword(@Body() body) {
    return this.authService.adminChangePassword(body.userId, body.newPassword);
  }

  @Get('verify-email/:token')
  async verifyEmailAddress(
    @Param() token: { token: string },
    @Res() Res: Response,
  ) {
    await this.authService.verifyEmail(token);
    Res.sendFile(
      path.join(dirname(require.main.filename), 'client/verification.html'),
    );
  }
}

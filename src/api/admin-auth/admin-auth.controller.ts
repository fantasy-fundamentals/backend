import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { Role } from 'src/api/auth/enums/role.enum';
import { RolesGuard } from 'src/api/auth/strategy/roles.guard';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthCredentialsDto } from './dto/admin-auth-credentials.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { AdminLoginCredentialsDto } from './dto/admin-login-credentials.dto';
import { BlockSubAdminDto, DeleteSubAdminDto } from './dto/block-sub-admin.dto';
import { AdminJwt2FaAuthGuard } from './strategy/admin-jwt-2fa.guard';
import { AdminJwtAuthGuard } from './strategy/admin.jwt.guard';

@ApiTags('admin-auth')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) { }

  @Post('/register')
  register(@Body() authCredentialsDto: AdminAuthCredentialsDto) {
    return this.adminAuthService.register(authCredentialsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @Get('/verify-jwt')
  verifyJwt() {
    return {
      jwtVerified: true,
    };
  }

  @Post('/login')
  login(
    @Body() loginCredentialsDto: AdminLoginCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.adminAuthService.login(loginCredentialsDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('/change-password')
  async changePassword(@Body() body: AdminChangePasswordDto, @Req() { user }) {
    return await this.adminAuthService.changePassword(
      user.id,
      body.newPassword,
      body.oldPassword,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/info')
  async getUserInfo(@Req() request) {
    return await this.adminAuthService.getUserInfo(request.user.email);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiParam({ name: 'userId' })
  @Get('/sdira/:userId')
  async block(@Param('userId') userId) {
    return this.adminAuthService.sdira(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/getAllSubAdmins')
  async getAllSubAdmins() {
    return await this.adminAuthService.getAllSubAdmins();
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('/register-subAdmin')
  registerSubAdmin(@Body() authCredentialsDto: AdminAuthCredentialsDto) {
    return this.adminAuthService.register(authCredentialsDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('/block-subAdmin')
  async blockUser(@Body() payload: BlockSubAdminDto) {
    return await this.adminAuthService.blockSubAdminAccount(payload);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Delete('/delete-subAdmin/:_id')
  async deleteAddress(@Param() param: DeleteSubAdminDto) {
    return await this.adminAuthService.deleteSubAdmin(param._id);
  }
}

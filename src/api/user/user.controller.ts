import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminJwt2FaAuthGuard } from 'src/api/admin-auth/strategy/admin-jwt-2fa.guard';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { Role } from 'src/api/auth/enums/role.enum';
import { RolesGuard } from 'src/api/auth/strategy/roles.guard';
import { Jwt2FaAuthGuard } from '../auth/strategy/jwt-2fa.guard';
import { BlockUserDto } from './dto/block-user.dto';
import { ChangeNotificationDto } from './dto/change-notification.dto';
import { ContactUsDto } from './dto/contact-us.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/edit')
  async updateUserInfo(
    @Body() updateProfileDto: UpdateUserDto,
    @Req() { user },
  ) {
    console.log(
      '🚀 ~ file: user.controller.ts ~ line 48 ~ UserController ~ user',
      user,
    );

    return await this.userService.updateUserInfo(user, updateProfileDto);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Get('/info')
  async getUserInfo(@Req() request) {
    return await this.userService.getUserInfo(request.user.email);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/update-profile-picture')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request,
  ) {
    return await this.userService.userProfile(
      updateProfileDto.profilePicture,
      request.user._id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/change-notification-status')
  async changeUserNotificationStatus(
    @Body() changeNotiDto: ChangeNotificationDto,
    @Req() { user },
  ) {
    return await this.userService.changeNotificationStatus(
      user,
      changeNotiDto.status,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/get-all-users')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/get-user-data/:email')
  async getUserData(@Param('email') email) {
    return await this.userService.getUserInfo(email);
  }

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Post('/logout')
  async handleLogout(@Req() { user }) {
    return await this.userService.handleUserLogout(user);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/export-all-users')
  async exportAllUsers(@Res() res: Response) {
    return await this.userService.getAllUsersReport(res);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @Post('/block-user')
  async blockUser(@Body() payload: BlockUserDto) {
    return await this.userService.blockUserAccount(payload);
  }

  @Post('/contact-us')
  async contactUs(@Body() payload: ContactUsDto) {
    return await this.userService.contactUs(payload);
  }
}

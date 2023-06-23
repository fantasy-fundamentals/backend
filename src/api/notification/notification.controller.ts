import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Jwt2FaAuthGuard } from 'src/api/auth/strategy/jwt-2fa.guard';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Get('/')
  getUserNotifications(@Req() { user }) {
    return this.notificationService.getUserNotifications(user);
  }
}

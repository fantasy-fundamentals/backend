import { Controller, Get } from '@nestjs/common';
import {
  Param,
  Req,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/decorators/admin.guard';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/')
  async getStats(req: Request, res: Response) {
    return this.dashboardService.getStats();
  }
}

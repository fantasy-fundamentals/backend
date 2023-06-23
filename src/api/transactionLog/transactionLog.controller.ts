import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Jwt2FaAuthGuard } from '../auth/strategy/jwt-2fa.guard';
import { TransactionLogService } from './transactionLog.service';

@ApiTags('Transaction logs')
@Controller('transaction-logs')
export class TransactionLogController {
  constructor(private transactionLogService: TransactionLogService) {}

  @ApiOperation({ summary: 'User get transaction logs' })
  @ApiBearerAuth()
  @UseGuards(Jwt2FaAuthGuard)
  @Get('/')
  async get(@Req() { user }) {
    return await this.transactionLogService.get(user._id);
  }

  @ApiOperation({ summary: 'Admin get all transaction logs' })
  @Get('/')
  async adminGetAll() {
    return await this.transactionLogService.adminGetAll();
  }
}

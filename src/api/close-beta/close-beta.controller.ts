import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Res,
  UseFilters,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CloseBetaService } from './close-beta.service';
import { CloseBetaDto } from './dto/close-beta.dto';
import { Response } from 'express';
import { HttpExceptionFilter } from 'src/shared/errors/http-exception.filter';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';

@UseFilters(new HttpExceptionFilter())
@ApiTags('Close beta management')
@Controller('close-beta')
export class CloseBetaController {
  constructor(private closeBetaService: CloseBetaService) {}

  @ApiOperation({ summary: 'Close beta registration' })
  @Post('/')
  async create(@Body() payload: CloseBetaDto) {
    return await this.closeBetaService.create(payload);
  }

  @ApiOperation({ summary: 'Admin get all' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @Get('/')
  async get(@Query() query: PaginationDto) {
    return await this.closeBetaService.get(query);
  }
}

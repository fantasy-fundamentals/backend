import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { NewsletterDto } from './dto/newsletter.dto';
import { Response } from 'express';

@ApiTags('Newsletter management')
@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @ApiOperation({ summary: 'Subscribe newsletter' })
  @Post('/')
  async create(@Body() payload: NewsletterDto) {
    return await this.newsletterService.create(payload);
  }

  @ApiOperation({ summary: 'Admin get all' })
  @Get('/')
  async get() {
    return await this.newsletterService.get();
  }

  @ApiOperation({ summary: 'Admin export all newsletter' })
  @Get('/export-all-newsletter')
  async export(@Res() res: Response) {
    return await this.newsletterService.export(res);
  }
}

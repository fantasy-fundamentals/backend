import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectArticleDto } from './dto/projectArticle.dto';
import { EmailPromotionService } from './emailPromotion.service';

@ApiTags('Email Promotion')
@Controller('email-promotion')
export class EmailPromotionController {
  constructor(private emailPromotionService: EmailPromotionService) {}

  @ApiOperation({ summary: 'Admin get all email promotions' })
  @Get('/')
  async get() {
    return await this.emailPromotionService.get();
  }

  @ApiOperation({ summary: 'Request email promotion' })
  @Post('add-email-promotion')
  async uploadkyc(@Body() payload: ProjectArticleDto) {
    return await this.emailPromotionService.create(payload);
  }

  @ApiOperation({ summary: 'Approve email promotion' })
  @Get('/approve/:userAddress')
  async approve(@Param('userAddress') userAddress: string) {
    return this.emailPromotionService.approve(userAddress);
  }
}

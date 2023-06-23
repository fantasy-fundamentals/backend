import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { UpdateNewsDTO } from './dto/update-news.dto';

@ApiTags('News management')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @ApiOperation({ summary: 'Sync news' })
  @Get('/sync')
  async sync() {
    return await this.newsService.sync();
  }

  @ApiOperation({ summary: 'Get recent news ' })
  @ApiQuery({ name: 'limit' })
  @Get('/recent')
  async listRecent(@Query() query: PaginationDto) {
    return await this.newsService.getRecentNewsByLimit(query);
  }

  @ApiOperation({ summary: 'Get news' })
  @ApiParam({ name: 'slug' })
  @Get('/:slug')
  async getNewsById(@Param('slug') slug: string) {
    return await this.newsService.getNewsById(slug);
  }

  @ApiOperation({ summary: 'Get news' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @Get('/')
  async getNews(@Query() query) {
    return await this.newsService.getNews(query);
  }

  @ApiBearerAuth()
  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Update an exisiting News' })
  @Put('/:newsId')
  async update(
    @Body() payload: UpdateNewsDTO,
    @Param('newsId', ValidateMongoId) newsId: string,
  ) {
    return await this.newsService.update(newsId, payload);
  }
}

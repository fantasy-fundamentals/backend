import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Put,
  Delete,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ProjectArticleDto,
  UpdateProjectArticleDTO,
} from './dto/projectArticle.dto';
import { ProjectArticleService } from './projectArticle.service';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { AdminAuthGuard } from 'src/decorators/admin.guard';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import { query } from 'express';

//@ApiBearerAuth()
//@UseGuards(AdminAuthGuard)
@ApiTags('Project Article')
@Controller('project-article')
export class ProjectArticleController {
  constructor(private projectArticleService: ProjectArticleService) {}

  @ApiOperation({ summary: 'Admin get project articles' })
  @Get()
  async get(@Query() query: PaginationDto) {
    return await this.projectArticleService.get(query);
  }

  @ApiOperation({ summary: 'Get single article by id' })
  @ApiParam({ name: 'articleId' })
  @Get('/get-article/:articleId')
  async getArticleById(@Param() { articleId }) {
    return await this.projectArticleService.findById(articleId);
  }

  @ApiOperation({ summary: 'Add project article' })
  @Post('add-project-article')
  async uploadkyc(@Body() payload: ProjectArticleDto) {
    return await this.projectArticleService.create(payload);
  }

  @ApiOperation({ summary: 'Update an existing project-article' })
  @Put('update-project-article/:id')
  async updateExistingProjectArticle(
    @Param('id', ValidateMongoId) id: string,
    @Body() payload: UpdateProjectArticleDTO,
  ) {
    return this.projectArticleService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete an existing project-article' })
  @Delete('delete-project-article/:id')
  async deleteProjectArticle(@Param('id', ValidateMongoId) id: string) {
    return this.projectArticleService.delete(id);
  }
}

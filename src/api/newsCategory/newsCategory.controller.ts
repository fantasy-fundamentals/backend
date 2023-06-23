import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsCategoryService } from './newsCategory.service';
import { NewsCategoryDto } from './dto/newsCategory.dto';

@ApiTags('News category management')
@Controller('news-category')
export class NewsCategoryController {
  constructor(private newsCategoryService: NewsCategoryService) {}

  @ApiOperation({ summary: 'Add news category' })
  @Post('/')
  async create(@Body() payload: NewsCategoryDto) {
    return await this.newsCategoryService.create(payload);
  }

  @ApiOperation({ summary: 'Get all' })
  @Get('/')
  async get() {
    return await this.newsCategoryService.get();
  }

  @ApiOperation({ summary: 'Update' })
  @Put('/')
  async update(@Param('id') id: string, @Body() payload: NewsCategoryDto) {
    return await this.newsCategoryService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.newsCategoryService.delete(id);
  }

  @ApiOperation({ summary: 'Change status' })
  @Post('/status')
  async status(@Body() payload): Promise<object> {
    return this.newsCategoryService.status(payload);
  }
}

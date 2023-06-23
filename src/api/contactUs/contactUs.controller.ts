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
import { ContactUsService } from './contactUs.service';
import { NewsCategoryDto } from './dto/contactUs.dto';

@ApiTags('Contact us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private contactUsService: ContactUsService) {}

  @ApiOperation({ summary: 'Add new request' })
  @Post('/')
  async create(@Body() payload: NewsCategoryDto) {
    return await this.contactUsService.create(payload);
  }

  @ApiOperation({ summary: 'Get all' })
  @Get('/')
  async get() {
    return await this.contactUsService.get();
  }

  @ApiOperation({ summary: 'Update' })
  @Put('/')
  async update(@Param('id') id: string, @Body() payload: NewsCategoryDto) {
    return await this.contactUsService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.contactUsService.delete(id);
  }

  @ApiOperation({ summary: 'Change status' })
  @Post('/status')
  async status(@Body() payload): Promise<object> {
    return this.contactUsService.status(payload);
  }
}

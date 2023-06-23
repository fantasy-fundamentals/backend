import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PositionService } from './positions.service';
import { PositionDto } from './dto/position.dto';

@ApiTags('Position management')
@Controller('position')
export class PositionController {
  constructor(private positionService: PositionService) {}

  @ApiOperation({ summary: 'Add new position' })
  @Post('/')
  async create(@Body() payload: PositionDto) {
    return await this.positionService.create(payload);
  }

  @ApiOperation({ summary: 'Get all' })
  @Get('/')
  async get() {
    return await this.positionService.get();
  }

  @ApiOperation({ summary: 'Update' })
  @ApiParam({ name: 'id' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() payload: PositionDto) {
    return await this.positionService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete' })
  @ApiParam({ name: 'id' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.positionService.delete(id);
  }

  @ApiOperation({ summary: 'Change status' })
  @Post('/status')
  async status(@Body() payload): Promise<object> {
    return this.positionService.status(payload);
  }
}

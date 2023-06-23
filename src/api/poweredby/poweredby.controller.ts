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
import { PoweredByService } from './poweredby.service';
import { PoweredByDto } from './dto/poweredby.dto';

@ApiTags('Powered by management')
@Controller('powered-by')
export class PoweredByController {
  constructor(private poweredByService: PoweredByService) {}

  @ApiOperation({ summary: 'Add powered by' })
  @Post('/')
  async create(@Body() payload: PoweredByDto) {
    return await this.poweredByService.create(payload);
  }

  @ApiOperation({ summary: 'Get all powered by' })
  @Get('/')
  async get() {
    return await this.poweredByService.get();
  }

  @ApiOperation({ summary: 'Update powered by' })
  @Put('/:id')
  async updateAdvertise(
    @Param('id') id: string,
    @Body() payload: PoweredByDto,
  ) {
    return await this.poweredByService.update(id, payload);
  }

  @ApiOperation({ summary: 'Delete advertise' })
  @Delete('/:id')
  async deleteAdvertise(@Param('id') id: string) {
    return await this.poweredByService.delete(id);
  }
}

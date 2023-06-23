import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import {
  PromoteDto,
  ApprovePromotionDto,
  ValidateDate,
  ValidateMonth,
} from './dto/promote.dto';
import { MongoExceptionFilter } from 'src/utils/validation-error.filter';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private promoteServices: PromotionsService) {}

  @ApiOperation({ summary: 'Add promotion after payment' })
  @UseFilters(MongoExceptionFilter)
  @Post('/')
  async create(@Body() promote: PromoteDto) {
    return await this.promoteServices.create(promote);
  }

  @ApiOperation({ summary: 'get all approved coin' })
  @ApiParam({ name: 'type' })
  @ApiParam({ name: 'limit' })
  @Get('/:type/:limit')
  async approvePromotion(@Param() { type, limit }) {
    return await this.promoteServices.get(type, limit);
  }

  @ApiOperation({ summary: 'approved promotions coin' })
  @Post('/approve')
  async approvePromotionCoin(@Body() approveDto: ApprovePromotionDto) {
    return await this.promoteServices.approve(approveDto);
  }

  @ApiOperation({ summary: 'get all coin by admin' })
  @Get('/admin')
  async getAdminCoin() {
    return await this.promoteServices.getAllAdmin();
  }

  @ApiOperation({ summary: 'Validate promotion date' })
  @Post('/validate-date')
  async validateDate(@Body() { date, type }: ValidateDate) {
    return await this.promoteServices.validateDate(date, type);
  }

  @ApiOperation({ summary: 'Validate month' })
  @Post('/validate-month')
  async validateMonth(@Body() { month, type }: ValidateMonth) {
    return await this.promoteServices.validateMonth(month, type);
  }
}

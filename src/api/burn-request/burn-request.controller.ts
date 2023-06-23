import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BurnRequestService } from './burn-request.service';
import { ChangeBurnRequestStatusDto } from './dto/burn-request.dto';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { UseGuards } from '@nestjs/common/decorators';
import { AdminAuthGuard } from 'src/decorators/admin.guard';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';

@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@ApiTags('Burn Request module')
@Controller('burn-request')
export class BurnRequestController {
  constructor(private burnRequestService: BurnRequestService) {}

  @ApiOperation({ summary: 'List all burn requests' })
  @Get('/')
  async create(@Query() query: PaginationDto) {
    return await this.burnRequestService.listAllRequests(query);
  }

  @ApiOperation({ summary: 'Add a new burn request' })
  @Put(':requestId/change-status')
  async changeRequestStatus(
    @Param('requestId', ValidateMongoId) requestId: string,
    @Body() body: ChangeBurnRequestStatusDto,
  ) {
    return await this.burnRequestService.changeRequestStatus(
      requestId,
      body.status,
    );
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeeManagementDto } from './dto/fee-management.dto';
import { FeeManagementService } from './fee-management.service';

@ApiTags('Fee Management')
@Controller('fee-management')
export class FeeManagementController {
  constructor(private feeService: FeeManagementService) {}

  @ApiOperation({ summary: 'Add Fee' })
  @Post('/add-fee')
  async addFee(@Body() fee: FeeManagementDto): Promise<Object> {
    return await this.feeService.addFee(fee);
  }
}

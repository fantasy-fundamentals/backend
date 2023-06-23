import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/utils/response/response.service';
import { KycDto } from './dto/kyc.dto';
import { KycService } from './kyc.service';
import { Response } from 'express';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(
    private readonly responseService: ResponseService,
    private kycService: KycService,
  ) {}

  @ApiOperation({ summary: 'Admin get kyc' })
  @Get('/')
  async get() {
    try {
      return await this.kycService.get();
    } catch (error) {
      return error;
    }
  }

  @ApiOperation({ summary: 'Add Kyc' })
  @Post('add-kyc')
  async uploadkyc(@Body() kyc: KycDto, @Res() res: Response) {
    try {
      this.responseService.successResponse(
        true,
        await this.kycService.uploadkyc(kyc),
        res,
      );
    } catch (error) {
      return this.responseService.badRequestResponse(
        'Some Error Occured, error thrown: ' + error,
        res,
      );
    }
  }

  @ApiOperation({ summary: 'Approve kyc' })
  @Get('/approve/:userAddress')
  async approve(@Param('userAddress') userAddress: string) {
    return this.kycService.approve(userAddress);
  }
}

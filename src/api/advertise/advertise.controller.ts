import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/utils/response/response.service';
import { AdvertiseService } from './advertise.service';
import { AdvertiseDto } from './dto/advertise.dto';

@ApiTags('Advertise management')
@Controller('advertise')
export class AdvertiseController {
  constructor(
    private readonly responseService: ResponseService,
    private advertiseService: AdvertiseService,
  ) {}

  @ApiOperation({ summary: 'Add advertise' })
  @Post('/add-advetise')
  async addAdvertise(@Body() advertise: AdvertiseDto, @Res() res: Response) {
    try {
      this.responseService.successResponse(
        true,
        await await this.advertiseService.getAdvertise(),
        res,
      );
    } catch (error) {
      return this.responseService.badRequestResponse(
        'Some Error Occured, error thrown: ' + error,
        res,
      );
    }
    return await this.advertiseService.addAdvertise(advertise);
  }

  @ApiOperation({ summary: 'Get all advertise' })
  @Get('/get-all-advertise')
  async getAdvertise(@Res() res: Response) {
    try {
      this.responseService.successResponse(
        true,
        await await this.advertiseService.getAdvertise(),
        res,
      );
    } catch (error) {
      return this.responseService.badRequestResponse(
        'Some Error Occured, error thrown: ' + error,
        res,
      );
    }
  }

  @ApiOperation({ summary: 'Update advertise' })
  @Put('/update-advertise/:advertiseId')
  async updateAdvertise(
    @Param('advertiseId') advertiseId: string,
    @Body() advertise: AdvertiseDto,
    @Res() res: Response,
  ) {
    try {
      this.responseService.successResponse(
        true,
        await this.advertiseService.updateAdvertise(advertiseId, advertise),
        res,
      );
    } catch (error) {
      return this.responseService.badRequestResponse(
        'Some Error Occured, error thrown: ' + error,
        res,
      );
    }
  }

  @ApiOperation({ summary: 'Delete advertise' })
  @Delete('/delete-advertise/:advertiseId')
  async deleteAdvertise(
    @Param('advertiseId') advertiseId: string,
    @Res() res: Response,
  ) {
    try {
      this.responseService.successResponse(
        true,
        await this.advertiseService.deleteAdvertise(advertiseId),
        res,
      );
    } catch (error) {
      return this.responseService.badRequestResponse(
        'Some Error Occured, error thrown: ' + error,
        res,
      );
    }
  }
}

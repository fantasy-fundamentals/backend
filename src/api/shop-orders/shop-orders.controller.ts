import {
  Get,
  Controller,
  Res,
  Post,
  Body,
  Query,
  UseGuards
} from '@nestjs/common';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { ShopOrderPaypalSuccessCallbackQueryParamsDto } from './models/shop-order-paypal-success-callback-query-params.dto';
import { ShopOrdersService } from './shop-orders.service';
import { CreateShopOrderDTO, CreateShopOrderViaWalletDTO } from './models/create-shop-orders.dto';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';

@ApiTags('Shop Orders')
@Controller('shop-orders')
export class ShopOrdersController {
  constructor(private readonly shopOrdersService: ShopOrdersService) { }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'List all paginated orders sorted by their date of creation in the descending order',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(AdminJwt2FaAuthGuard)
  @Get('/')
  async listAll(@Query() query: PaginationDto, @Res() res) {
    try {
      const { data, total } = await this.shopOrdersService.get(query);
      return res.status(HttpStatus.OK).json({
        data,
        total
      })
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Failed to fetch orders'
      })
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hit this API if you want to create a new Paypal payment intent' })
  @UseGuards(JwtAuthGuard)
  @Post('/paypal')
  async pay(@Body() body: CreateShopOrderDTO, @Res() res) {
    try {
      const redirectUrl: string = await this.shopOrdersService.generateIntent(body);
      return res.status(HttpStatus.CREATED).json({
        redirectUrl
      })
    } catch (e) {
      return res.status(e.status || HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: e || e.message || 'Payment Failed'
      })
    }
  }

  @Get('/paypal/success')
  async handlePaypalSuccessCallback(@Res() res, @Query() query: ShopOrderPaypalSuccessCallbackQueryParamsDto) {
    try {
      const response = await this.shopOrdersService.handleSuccessCallback(query);
      return res.status(200).json({
        error: false,
        message: response
      })
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        message: e || 'Bad Request'
      })
    }
  }

  @Get('/paypal/cancel')
  async handlePaypalCancelCallback(@Res() res) {
    const ERROR_MESSAGE = 'Failed to complete payment'
    return res.status(400).json({
      message: ERROR_MESSAGE
    })
  }


  @Post('/paypal/webhook/payment-sale-completed')
  async handlePaymentSaleCompleted(@Body() body, @Res() res) {
    try {
      await this.shopOrdersService.handlePaymentSaleCompleted(body.resource.parent_payment);
      return res.status(200).json({
        message: 'Order completed successfully'
      })
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Bad Request'
      })
    }
  }

  @ApiOperation({ summary: 'Payment through wallet' })
  @UseGuards(JwtAuthGuard)
  @Post('/via/wallet')
  async paymentViaWallet(@Body() body: CreateShopOrderViaWalletDTO) {
    return await this.shopOrdersService.payViaWallet(body);
  }
}
import {
  Get,
  Controller,
  Res,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NftOrderService } from './nft-order.service';
import { PaginationDto } from 'src/shared/DTOs/paginated-page-limit.dto';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { NftOrderPaypalSuccessCallbackQueryParamsDto } from './models/nft-order-paypal-success-callback-query-params.dto';
import {
  CreateNftOrderDto,
  CreateNftOrderDtoViaWalletDto,
  CreateNftOrderDtoViaStripeDto,
} from './models/create-nft-order.dto';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';

@ApiTags('Order Management')
@Controller('nft-orders')
export class NftOrderController {
  constructor(private readonly nftOrderService: NftOrderService) {}

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
      const { data, total } = await this.nftOrderService.get(query);
      return res.status(HttpStatus.OK).json({
        data,
        total,
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Failed to fetch orders',
      });
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hit this API if you want to create a new Paypal payment intent',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/paypal')
  async pay(@Body() body: CreateNftOrderDto, @Res() res) {
    try {
      const redirectUrl: string = await this.nftOrderService.generateIntent(
        body,
      );
      return res.status(HttpStatus.CREATED).json({
        redirectUrl,
      });
    } catch (e) {
      return res.status(e.status || HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: e || e.message || 'Payment Failed',
      });
    }
  }

  @ApiOperation({ summary: 'Paypal Success Callback Url' })
  @Get('/paypal/success')
  async handlePaypalSuccessCallback(
    @Res() res,
    @Query() query: NftOrderPaypalSuccessCallbackQueryParamsDto,
  ) {
    try {
      const response = await this.nftOrderService.handleSuccessCallback(query);
      return res.status(200).json({
        error: false,
        message: response,
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: true,
        message: 'Bad Request',
      });
    }
  }

  @ApiOperation({
    summary:
      'Url that gets triggered by Paypal when user does not want to proceed the payment ',
  })
  @Get('/paypal/cancel')
  async handlePaypalCancelCallback(@Res() res) {
    const ERROR_MESSAGE = 'Failed to complete payment';
    return res.status(400).json({
      message: ERROR_MESSAGE,
    });
  }

  @ApiOperation({
    summary:
      'Webhook that gets triggered by Paypal after they receive a payment for a particular Order ',
  })
  @Post('/paypal/webhook/payment-sale-completed')
  async handlePaymentSaleCompleted(@Body() body, @Res() res) {
    console.log('here');
    try {
      await this.nftOrderService.handlePaymentSaleCompleted(
        body.resource.parent_payment,
      );
      return res.status(200).json({
        message: 'Order completed successfully',
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Bad Request',
      });
    }
  }

  @ApiOperation({ summary: 'Payment through wallet' })
  @UseGuards(JwtAuthGuard)
  @Post('/via/wallet')
  async paymentViaWallet(@Body() body: CreateNftOrderDtoViaWalletDto) {
    return await this.nftOrderService.payViaWallet(body);
  }

  @ApiOperation({ summary: 'Payment through stripe' })
  @UseGuards(JwtAuthGuard)
  @Post('/via/stripe')
  async paymentViaStripe(@Body() body: CreateNftOrderDtoViaStripeDto) {
    return await this.nftOrderService.payViaStripe(body);
  }
}

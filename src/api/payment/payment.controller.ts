import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  Res
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CryptoPaymentDto, PaymentDto } from './dto/payment.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategy/jwt.guard';
import { CreateNftOrderDto } from '../nft-orders/models/create-nft-order.dto';

@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @Post('/stripe')
  stripe(@Res() response: Response, @Body() paymentRequestBody: PaymentDto) {
    this.paymentService
      .stripePayment(paymentRequestBody)
      .then((res) => {
        response.status(HttpStatus.CREATED).json(res);
      })
      .catch((err) => {
        response.status(HttpStatus.BAD_REQUEST).json(err);
      });
  }
}

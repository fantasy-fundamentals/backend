import { Module } from '@nestjs/common';
import { NftOrderModule } from '../nft-orders/nft-order.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [NftOrderModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }

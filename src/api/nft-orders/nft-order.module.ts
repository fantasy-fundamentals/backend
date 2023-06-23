import { Module } from '@nestjs/common';
import { NftModule } from '../nft/nft.module';
import { PaypalModule } from '../paypal/paypal.module';
import { TransactionLogModule } from '../transactionLog/transactionLog.module';
import { NftOrderController } from './nft-order.controller';
import { NftOrderService } from './nft-order.service';

@Module({
  imports: [PaypalModule, NftModule, TransactionLogModule],
  controllers: [NftOrderController],
  providers: [NftOrderService],
  exports: [NftOrderService],
})
export class NftOrderModule {}

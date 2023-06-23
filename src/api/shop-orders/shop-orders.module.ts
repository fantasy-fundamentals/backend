import { Module } from '@nestjs/common';
import { PaypalModule } from '../paypal/paypal.module';
import { ShopModule } from '../shop/shop.module';
import { ShopOrdersController } from './shop-orders.controller';
import { ShopOrdersService } from './shop-orders.service';

@Module({
  imports: [PaypalModule, ShopModule],
  controllers: [ShopOrdersController],
  providers: [ShopOrdersService],
  exports: [ShopOrdersService]
})
export class ShopOrdersModule { }

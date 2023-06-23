import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PlayerModule } from '../players/player.module';
import { ShopModule } from '../shop/shop.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PlayerModule, ShopModule, UserModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule { }

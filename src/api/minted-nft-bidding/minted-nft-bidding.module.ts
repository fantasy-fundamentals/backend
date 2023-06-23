import { Module } from '@nestjs/common';
import { GatewaysModule } from '../gateways/gateways.module';
import { MintedNftBiddingController } from './mintednft-bidding.controller';
import { MintedNftBiddingService } from './mintednft-bidding.service';

@Module({
  providers: [MintedNftBiddingService],
  controllers: [MintedNftBiddingController],
  exports: [MintedNftBiddingService],
})
export class MintedNftBiddingModule {}

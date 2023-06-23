import { Module } from '@nestjs/common';
import { MintedNftBiddingModule } from '../minted-nft-bidding/minted-nft-bidding.module';
import { PrizeDistributionService } from './prize-distribution.service';
import { EmailHandlerModule } from '../email-handler/email-handler.module';
import { NftRatesCron } from './prize-distribution.cron';
import { PrizeDistributionController } from './prize-distribution.controller';

@Module({
  imports: [MintedNftBiddingModule, EmailHandlerModule],
  controllers: [PrizeDistributionController],
  providers: [PrizeDistributionService, NftRatesCron],
  exports: [PrizeDistributionService],
})
export class PrizeDistributionModule {}

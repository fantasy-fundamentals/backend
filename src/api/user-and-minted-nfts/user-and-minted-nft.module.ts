import { Module } from '@nestjs/common';
import { MintedNftBiddingModule } from '../minted-nft-bidding/minted-nft-bidding.module';
import { UserAndMintedNftController } from './user-and-minted-nft.controller';
import { UserAndMintedNftService } from './user-and-minted-nft.service';
import { EmailHandlerModule } from '../email-handler/email-handler.module';
import { GatewaysModule } from '../gateways/gateways.module';
import { BurnRequestModule } from '../burn-request/burn-request.module';

@Module({
  imports: [MintedNftBiddingModule, EmailHandlerModule, GatewaysModule, BurnRequestModule],
  controllers: [UserAndMintedNftController],
  providers: [UserAndMintedNftService],
  exports: [UserAndMintedNftService],
})
export class UserAndMintedNftModule {}

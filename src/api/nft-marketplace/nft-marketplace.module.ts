import { Module } from '@nestjs/common';
import { NFTMarketplaceController } from './nft-marketplace.controller';
import { NFTMarketplaceService } from './nft-marketplace.service';

@Module({
  controllers: [NFTMarketplaceController],
  providers: [NFTMarketplaceService],
})
export class NFTMarketplaceModule { }

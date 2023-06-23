import { Module } from '@nestjs/common';
import { NftWhitelistController } from './nft-whitelist.controller';
import { NftWhitelistService } from './nft-whitelist.service';

@Module({
  controllers: [NftWhitelistController],
  providers: [NftWhitelistService],
})
export class NftWhitelistModule {}

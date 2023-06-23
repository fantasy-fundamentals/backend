import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { DetectGuestOrAutheticatedUserMiddleware } from 'src/shared/middlewares/detect-guest-or-authenticated-user.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { UserAndMintedNftModule } from '../user-and-minted-nfts/user-and-minted-nft.module';
import { S3StorageModule } from '../s3Storage/s3Storage.module';
import { GatewaysModule } from '../gateways/gateways.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    UserAndMintedNftModule,
    S3StorageModule,
    GatewaysModule,
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DetectGuestOrAutheticatedUserMiddleware).forRoutes('/');
  }
}

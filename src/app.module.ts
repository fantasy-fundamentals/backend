import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './api/dashboard/dashboard.module';
import { S3StorageModule } from './api/s3Storage/s3Storage.module';
import { SettingsModule } from './api/settings/settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EntitiesModule } from './database/entities/entities.module';
import { UserModule } from './api/user/user.module';
import { ProjectArticleModule } from './api/projectArticle/projectArticle.module';
import { NewsModule } from './api/news/news.module';
import { CloseBetaModule } from './api/close-beta/close-beta.module';
import { AdminAuthModule } from './api/admin-auth/admin-auth.module';
import { AuthModule } from './api/auth/auth.module';
import { TwoFaModule } from './api/two-fa/two-fa.module';
import { EmailHandlerModule } from './api/email-handler/email-handler.module';
import { PlayerModule } from './api/players/player.module';
import { TeamModule } from './api/teams/team.module';
import { ScoreModule } from './api/scores/score.module';
import { ShopModule } from './api/shop/shop.module';
import { PlayerFavoriteModule } from './api/player-favorite/player-favorite.module';
import { PaymentModule } from './api/payment/payment.module';
import { NFTMarketplaceModule } from './api/nft-marketplace/nft-marketplace.module';
import { NftOrderModule } from './api/nft-orders/nft-order.module';
import { NftModule } from './api/nft/nft.module';
import { PaypalModule } from './api/paypal/paypal.module';
import { UserAndMintedNftModule } from './api/user-and-minted-nfts/user-and-minted-nft.module';
import { MintedNftBiddingModule } from './api/minted-nft-bidding/minted-nft-bidding.module';
import { ShopOrdersModule } from './api/shop-orders/shop-orders.module';
import { PositionModule } from './api/positions/positions.module';
import { AdminImportModule } from './api/admin-import/admin-import.module';
import { PrizeDistributionModule } from './api/prize-distribution/prize-distribution.module';
import { ContactUsModule } from './api/contactUs/contactUs.module';
import { GatewaysModule } from './api/gateways/gateways.module';
import { TransactionLogModule } from './api/transactionLog/transactionLog.module';
import { NewsletterModule } from './api/newsletter/newsletter.module';
import { GameLogModule } from './api/gameLog/gameLog.module';
import { BurnRequestModule } from './api/burn-request/burn-request.module';
import { CardanoModule } from './api/cardano-client/cardano.client.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule,
    ScheduleModule.forRoot(),
    AuthModule,
    TwoFaModule,
    AdminAuthModule,
    DashboardModule,
    SettingsModule,
    AuthModule,
    ConfigModule,
    DatabaseModule,
    EntitiesModule,
    S3StorageModule,
    UserModule,
    ProjectArticleModule,
    CloseBetaModule,
    EmailHandlerModule,
    PlayerModule,
    TeamModule,
    NewsModule,
    ScoreModule,
    ShopModule,
    PlayerFavoriteModule,
    PaymentModule,
    NFTMarketplaceModule,
    NftModule,
    PaypalModule,
    NftOrderModule,
    UserAndMintedNftModule,
    MintedNftBiddingModule,
    ShopOrdersModule,
    PositionModule,
    AdminImportModule,
    PrizeDistributionModule,
    ContactUsModule,
    GatewaysModule,
    TransactionLogModule,
    NewsletterModule,
    GameLogModule,
    BurnRequestModule,
    CardanoModule

  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [JwtModule],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminEntity, AdminSchema } from './admin.entity';

import { AdvertiseEntity, AdvertiseSchema } from './advertise.entity';
import {
  CoinManagemnetEntity,
  CoinManagemnetSchema,
} from './coin-managemnet.entity';
import { Coin, CoinSchema } from './coins.entity';
import { Currency, CurrencySchema } from './currency.entity';
import {
  FeeManagementEntity,
  FeeManagementEntitySchema,
} from './fee-management.entity';
import { KycEntity, KycSchema } from './kyc.entity';
import { SettingsEntity, SettingsSchema } from './settings.entity';
import { NativeWalletEntity, NativeWalletSchema } from './nativeWallet.entity';
import { NotifyEmailEntity, NotifyEmailSchema } from './notify-email.entity';
import { PromoteEntity, PromoteSchema } from './promote.entity';
import { Rate, RateSchema } from './rates.entity';
import { UserEntity, UserSchema } from './user.entity';
import {
  ReferralCommissionEntity,
  ReferralCommissionSchema,
} from './referralCommission.entity';
import { SocialLinkEntity, SocialLinksSchema } from './social-links.entity';
import {
  ExternalWalletEntity,
  ExternalWalletSchema,
} from './externalWallet.entity ';
import { NftWhitelistEntity, NftWhitelistSchema } from './nft-whitelist.entity';
import {
  HistoricalRates,
  HistoricalRatesSchema,
} from './historicalRates.entity';
import { PoweredBy, PoweredBySchema } from './poweredBy.entity';
import { SparkLine, SparklinesSchema } from './sparkline.entity';
import {
  ProjectArticleEntity,
  ProjectArticleSchema,
} from './projectArticle.entity';
import {
  EmailPromotionEntity,
  EmailPromotionSchema,
} from './emailPromotion.entity';
import { Marketplace, MarketplaceSchema } from './marketplace.entity';
import { TransactionLog, TransactionLogSchema } from './transactionsLog.entity';
import { NewsCategoryEntity, NewsCategorySchema } from './newsCategory.entity';
import { NewsEntity, NewsSchema } from './news.entity';
import { WatchListEntity, WatchListSchema } from './watchList.entity';
import { CloseBetaEntity, CloseBetaSchema } from './close-beta.entity';
import { NotificationEntity, NotificationSchema } from './notification.entity';
import { WalletEntity, WalletSchema } from './wallet.entity';
import {
  PasswordResetEntity,
  PasswordResetSchema,
} from './passwordReset.entity';
import { PlayerEntity, PlayerSchema } from './player.entity';
import { TeamEntity, TeamSchema } from './team.entity';
import { ScoreEntity, ScoreSchema } from './score.entity';
import { ShopEntity, ShopSchema } from './shop.entity';
import {
  PlayerFavoriteEntity,
  PlayerFavoriteSchema,
} from './player-favorite.entity';
import {
  NFTMarketplaceEntity,
  NFTMarketplaceSchema,
} from './nft-marketplace.entity';
import { NftEntity, NftSchema } from './nft.entity';
import { NftOrderEntity, NftOrderSchema } from './nft-order.entity';
import { CounterSchema, CounterEntity } from './counter.entity';
import {
  UserAndMintedNftSchema,
  UserAndMintedNftEntity,
} from './user-and-minted-nfts.entity';
import {
  PaypalPaymentSecretSchema,
  PaypalPaymentSecretEntity,
} from './paypal-payment-secret.entity';

import {
  MintedNftBiddingSchema,
  MintedNftBiddingEntity,
} from './minted-nft-bidding';
import { ShopOrderEntity, ShopOrderSchema } from './shop-order.entity';
import { PlayerVideoEntity, PlayerVideoSchema } from './player-video.entity';
import { PositionEntity, PositionSchema } from './position.entity';
import { AdminImportEntity, AdminImportSchema } from './admin-import.entity';
import { ContactUs, ContactUsSchema } from './contact-us.entity';
import { NewsLetter, NewsLetterSchema } from './newsletter.entity';
import { GameLog, GameLogSchema } from './gameLog.entity';
import { BurnRequestEntity, BurnRequestSchema } from './burn-request.entity';

const entitiesArray = [
  MongooseModule.forFeature([
    { name: AdminEntity.name, schema: AdminSchema },
    { name: FeeManagementEntity.name, schema: FeeManagementEntitySchema },
    { name: CoinManagemnetEntity.name, schema: CoinManagemnetSchema },
    { name: SettingsEntity.name, schema: SettingsSchema },
    { name: SocialLinkEntity.name, schema: SocialLinksSchema },
    { name: NotifyEmailEntity.name, schema: NotifyEmailSchema },
    { name: NewsLetter.name, schema: NewsLetterSchema },
    { name: Coin.name, schema: CoinSchema },
    { name: Currency.name, schema: CurrencySchema },
    { name: Rate.name, schema: RateSchema },
    { name: PromoteEntity.name, schema: PromoteSchema },
    { name: AdvertiseEntity.name, schema: AdvertiseSchema },
    { name: UserEntity.name, schema: UserSchema },
    { name: KycEntity.name, schema: KycSchema },
    { name: NativeWalletEntity.name, schema: NativeWalletSchema },
    { name: ExternalWalletEntity.name, schema: ExternalWalletSchema },
    { name: ReferralCommissionEntity.name, schema: ReferralCommissionSchema },
    { name: NftWhitelistEntity.name, schema: NftWhitelistSchema },
    { name: HistoricalRates.name, schema: HistoricalRatesSchema },
    { name: PoweredBy.name, schema: PoweredBySchema },
    { name: SparkLine.name, schema: SparklinesSchema },
    { name: ProjectArticleEntity.name, schema: ProjectArticleSchema },
    { name: EmailPromotionEntity.name, schema: EmailPromotionSchema },
    { name: Marketplace.name, schema: MarketplaceSchema },
    { name: TransactionLog.name, schema: TransactionLogSchema },
    { name: NewsCategoryEntity.name, schema: NewsCategorySchema },
    { name: NewsEntity.name, schema: NewsSchema },
    { name: WatchListEntity.name, schema: WatchListSchema },
    { name: CloseBetaEntity.name, schema: CloseBetaSchema },
    { name: NotificationEntity.name, schema: NotificationSchema },
    { name: WalletEntity.name, schema: WalletSchema },
    { name: PasswordResetEntity.name, schema: PasswordResetSchema },
    { name: SettingsEntity.name, schema: SettingsSchema },
    { name: PlayerEntity.name, schema: PlayerSchema },
    { name: TeamEntity.name, schema: TeamSchema },
    { name: ScoreEntity.name, schema: ScoreSchema },
    { name: ShopEntity.name, schema: ShopSchema },
    { name: PlayerFavoriteEntity.name, schema: PlayerFavoriteSchema },
    { name: NFTMarketplaceEntity.name, schema: NFTMarketplaceSchema },
    { name: NftEntity.name, schema: NftSchema },
    { name: NftOrderEntity.name, schema: NftOrderSchema },
    { name: CounterEntity.name, schema: CounterSchema },
    { name: UserAndMintedNftEntity.name, schema: UserAndMintedNftSchema },
    { name: PaypalPaymentSecretEntity.name, schema: PaypalPaymentSecretSchema },
    { name: MintedNftBiddingEntity.name, schema: MintedNftBiddingSchema },
    { name: ShopOrderEntity.name, schema: ShopOrderSchema },
    { name: PlayerVideoEntity.name, schema: PlayerVideoSchema },
    { name: PositionEntity.name, schema: PositionSchema },
    { name: AdminImportEntity.name, schema: AdminImportSchema },
    { name: ContactUs.name, schema: ContactUsSchema },
    { name: GameLog.name, schema: GameLogSchema },
    { name: BurnRequestEntity.name, schema: BurnRequestSchema}
  ]),
];

@Global()
@Module({
  imports: [...entitiesArray],
  exports: [...entitiesArray],
})
export class EntitiesModule {}

export enum FILE_TYPE {
  COIN_IMAGE = 'coinImage',
  SITE_LOGO = 'siteLogo',
  BANNER_IMAGE = 'bannerImage',
  PRESS_RELEASE = 'pressRelease',
  PROFILE_PICTURE = 'profilePicture',
  TOKEN_FONTS = 'tokenFonts',
  CHATS = 'chat',
  NFT_TOKENS = 'nftTokens',
  DIRECT_WIRE = 'directWire',
  MARKETPLACE = 'marketplace',
  NEWS = 'news',
  NFT = 'NFT',
}

export enum PROMOTION_TYPE {
  COIN = 'coin',
  BANNER = 'banner',
  PRESS = 'press',
}

export enum PROMOTION_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXPIRED = 'expired',
  BLOCKED = 'blocked',
}

export enum NATIVE_WALLETS_TYPE {
  ADMIN_WALLET = 'adminWallet',
  TREASURY_ALLOCATION_WALLET = 'treasuryAllocationWallet',
  PROJECT_DISTRIBUTION_WALLET = 'projectDistributionWallet',
  BURNED_TOKENS_WALLET = 'burnedTokensWallet',
  NFT_DISTRIBUTION_WALLET = 'nftDistributionWallet',
  REFERRAL_DISTRIBUTION_WALLET = 'referralDistributionWallet',
  PROJECT_WALLET = 'projectWallet',
}

export enum EXTERNAL_WALLETS_TYPE {
  NFT_GNOSIS_WALLET = 'nftGnosisWallet',
  TREASURY_WALLET = 'treasuryWallet',
  PROFIT_WALLET = 'profitWallet',
  DEAD_WALLET = 'deadWallet',
}

export enum USER_WALLETS_TYPE {
  REFERRAL_WALLET = 'referralWallet',
}

export enum TOKEN_TRANSFER_PERCENTAGE {
  ADMIN_WALLET_PERCENTAGE = 1,
  TREASURY_ALLOCATION_WALLET_PERCENTAGE = 0.1,
  PROJECT_DISTRIBUTION_WALLET_PERCENTAGE = 0.7,
  BURNED_TOKENS_WALLET_PERCENTAGE = 0.05,
  NFT_DISTRIBUTION_WALLET_PERCENTAGE = 0.1,
  REFERRAL_DISTRIBUTION_WALLET_PERCENTAGE = 0.05,
}

export enum TOKEN_TRANSFER_SUCCESS_MESSAGE {
  TRANSFERED = 'Token transfered successfully',
}

export enum POWERED_BY {
  partner = 'partner',
  sponser = 'sponser',
}

export enum COIN_LIST_FILTER {
  todaysHot = 'todaysHot',
  launchDate = 'launchDate',
  marketCap = 'marketCap',
  walletAddress = 'walletAddress',
}

export enum Partner_Type {
  partner = 'partner',
  superPartner = 'superPartner',
}

export enum TRANSACTION_LOG {
  buy = 'buy',
  sell = 'sell',
  mint = 'mint',
}

export enum PAYMENT_SOURCE {
  webPurchased = 'webPurchased',
}


export enum Position {
  QB = 'QB',
  RB = 'RB',
  WR = 'WR',
  TE = 'TE',
}
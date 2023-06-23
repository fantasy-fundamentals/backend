export interface ConfigInterface {
  NODE_ENV: string;
  JWT_SECRET: string;
  PORT: string;
  MONGO_URI: string;

  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_BUCKET: string;
  AWS_REGION: string;

  FROM_EMAIL: string;
  BCC_EMAIL: string;
  SENDGRID_API_KEY: string;

  TWILIO_AUTH_TOKEN: string;
  TWILIO_ACCOUNT_SID: string;

  PAYMENT_RECEIVING_WALLET: string;

  ORDER_PAYMENT_ADDRESS: string;
  SECRET_KEY: string;

  SALT_OR_ROUNDS: number;

  MAIL_CHIMP_LIST_ID: string;
  MAIL_CHIMP_API_KEY: string;
  MAIL_CHIMP_REGION: string;
  TWITTER_API_AUTH: string;
  TWITTER_USER_ID: string;

  BUCKET_SECRET_ACCESS_KEY: string;
  BUCKET_ACCESS_KEY: string;
  BUCKET_NAME: string;
  BUCKET_REGION: string;

  // MORALIS_APP_ID: string;
  // MORALIS_SERVER_URL: string;
  // MORALIS_MASTER_KEY: string;

  // BSC_RPC_URL: string;
  // ETH_RPC_URL: string;
  // ETH_WS_URL: string;

  // ETH_EXPLORER: string;
  // BSC_EXPLORER: string;
  // BSC_EXPLORER_API_KEY: string;
  // ETH_CHAIN: string;
  // ETH_CHAIN_ID: string;

  // BSC_CHAIN: string;
  // BSC_CHAIN_ID: string;

  ENCRYTPION_IV: string;
  ENCRYTPTION_KEY: string;

  // NETWORK: string;

  SEND_GRID_KEY: string;
  ADMIN_EMAIL: string;

  // FIREBASE_PROJECT_ID: string;
  // FIREBASE_PRIVATE_KEY: string;
  // FIREBASE_CLIENT_EMAIL: string;

  STRIPE_API_SECRET_KEY: string;

  CARDANO_NODE: string;
  SIGNER_ADDRESS: string;
  SIGNER_NAME: string;
  KEY_HASH: string;
  TYPE: string;
  POLICY_ID: string;
}

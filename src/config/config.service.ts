import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { Injectable } from '@nestjs/common';
import { ConfigInterface } from './interfaces/config.interface';
import { IRedisCacheConfig } from 'src/shared/modules/redis/redis-cache.types';
import { PaypalConfig } from 'src/api/paypal/models/paypal-config.type';
@Injectable()
export class ConfigService {
  private readonly envConfig: ConfigInterface;

  constructor() {
    dotenv.config({ path: `env/.env.development` });
    const config: { [name: string]: string } = process.env;
    const parsedConfig = JSON.parse(JSON.stringify(config));
    this.envConfig = this.validateInput(parsedConfig);
  }

  private validateInput = (envConfig): ConfigInterface => {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .required()
        .valid(
          'development',
          'production',
          'staging',
          'provision',
          'inspection',
        )
        .default('development'),
      PORT: Joi.number().required(),
      MONGO_URI: Joi.string().required(),
      JWT_SECRET: Joi.string().required(),
      SALT_OR_ROUNDS: Joi.number().required(),
      MAIL_CHIMP_LIST_ID: Joi.string().required(),
      MAIL_CHIMP_API_KEY: Joi.string().required(),
      MAIL_CHIMP_REGION: Joi.string().required(),
      TWITTER_API_AUTH: Joi.string().required(),
      BUCKET_SECRET_ACCESS_KEY: Joi.string().required(),
      BUCKET_ACCESS_KEY: Joi.string().required(),
      BUCKET_NAME: Joi.string().required(),
      BUCKET_REGION: Joi.string().required(),
      // FROM_EMAIL: Joi.string().required(),
      // BCC_EMAIL: Joi.string().required(),
      // SENDGRID_API_KEY: Joi.string().required(),
      // TWILIO_AUTH_TOKEN: Joi.string().required(),
      // TWILIO_ACCOUNT_SID: Joi.string().required(),
      // AWS_ACCESS_KEY: Joi.string().required(),
      // AWS_SECRET_KEY: Joi.string().required(),
      // AWS_BUCKET: Joi.string().required(),
      // AWS_REGION: Joi.string().required(),
      // PAYMENT_RECEIVING_WALLET: Joi.string().required(),

      // MORALIS_APP_ID: Joi.string().required(),
      // MORALIS_SERVER_URL: Joi.string().required(),
      // MORALIS_MASTER_KEY: Joi.string().required(),
      // BSC_RPC_URL: Joi.string().required(),
      // ETH_RPC_URL: Joi.string().required(),
      // ETH_WS_URL: Joi.string().required(),
      // ETH_EXPLORER: Joi.string().required(),
      // BSC_EXPLORER: Joi.string().required(),
      // BSC_EXPLORER_API_KEY: Joi.string().required(),
      // ETH_CHAIN: Joi.string().required(),
      // ETH_CHAIN_ID: Joi.string().required(),
      // BSC_CHAIN: Joi.string().required(),
      // BSC_CHAIN_ID: Joi.string().required(),
      ENCRYTPION_IV: Joi.string().required(),
      ENCRYTPTION_KEY: Joi.string().required(),
      // NETWORK: Joi.string().required(),
      // FIREBASE_PROJECT_ID: Joi.string().required(),
      // FIREBASE_PRIVATE_KEY: Joi.string().required(),
      // FIREBASE_CLIENT_EMAIL: Joi.string().required(),

      CARDANO_NODE: Joi.string().required(),
      SIGNER_ADDRESS: Joi.string().required(),
      SIGNER_NAME: Joi.string().required(),
      KEY_HASH: Joi.string().required(),
      TYPE: Joi.string().required(),
      POLICY_ID: Joi.string().required(),
    });
    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      envConfig,
      {
        abortEarly: false,
        allowUnknown: true,
      },
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  };

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get port(): string {
    return this.envConfig.PORT;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get mongoUri(): string {
    return this.envConfig.MONGO_URI;
  }

  get saltOrRound(): number {
    return this.envConfig.SALT_OR_ROUNDS;
  }

  get mailChimpListID(): string {
    return this.envConfig.MAIL_CHIMP_LIST_ID;
  }

  get mailChimpApiKey(): string {
    return this.envConfig.MAIL_CHIMP_API_KEY;
  }

  get mailChimpRegion(): string {
    return this.envConfig.MAIL_CHIMP_REGION;
  }

  get getTwitterPost(): string {
    return this.envConfig.TWITTER_API_AUTH;
  }

  get getTwitterUserID(): string {
    return this.envConfig.TWITTER_USER_ID;
  }
  get getBucketSecretKey(): string {
    return this.envConfig.BUCKET_SECRET_ACCESS_KEY;
  }
  get getBucketAccessKEy(): string {
    return this.envConfig.BUCKET_ACCESS_KEY;
  }
  get getBucketName(): string {
    return this.envConfig.BUCKET_NAME;
  }
  get getbucketRegion(): string {
    return this.envConfig.BUCKET_REGION;
  }

  get(key: string) {
    return this.envConfig[key];
  }

  get RedisCacheConfig(): IRedisCacheConfig {
    return {
      host: this.get('REDIS_CACHE_HOST'),
      port: this.get('REDIS_CACHE_PORT'),
      ttl: this.get('REDIS_CACHE_TTL'),
    };
  }

  get PaypalConfig(): PaypalConfig {
    return {
      mode: 'sandbox',
      client_id: this.get('PAYPAL_CLIENT_ID'),
      client_secret: this.get('PAYPAL_SECRET'),
    };
  }

  // get awsAccessKey(): string {
  //     return this.envConfig.AWS_ACCESS_KEY;
  // }

  // get awsSeceretKey(): string {
  //     return this.envConfig.AWS_SECRET_KEY;
  // }

  // get awsRegion(): string {
  //     return this.envConfig.AWS_REGION;
  // }

  // get awsBucket(): string {
  //     return this.envConfig.AWS_BUCKET;
  // }

  get fromEmail(): string {
    return this.envConfig.FROM_EMAIL;
  }

  get backendUrl(): string {
    return this.get('BACKEND_URL');
  }

  get frontendUrl(): string {
    return this.get('FRONTEND_URL');
  }

  // get bccEmail(): string {
  //     return this.envConfig.BCC_EMAIL;
  // }

  // get twilioAuthToken(): string {
  //     return this.envConfig.TWILIO_AUTH_TOKEN;
  // }

  // get twilioAccountSid(): string {
  //     return this.envConfig.TWILIO_ACCOUNT_SID;
  // }

  // get paymentReceivingWallet(): string {
  //     return this.envConfig.PAYMENT_RECEIVING_WALLET;
  // }

  // get orderPaymentAddress(): string {
  //     return this.envConfig.ORDER_PAYMENT_ADDRESS;
  // }

  // get secretKey(): string {
  //     return this.envConfig.SECRET_KEY;
  // }

  // get moralisAppId(): string {
  //   return this.envConfig.MORALIS_APP_ID;
  // }
  get moralisServerUrl(): string {
    return this.envConfig.BUCKET_SECRET_ACCESS_KEY;
  }
  // get moralisMasterKey(): string {
  //   return this.envConfig.MORALIS_MASTER_KEY;
  // }
  // get bscRpcUrl(): string {
  //   return this.envConfig.BSC_RPC_URL;
  // }
  // get ethRpcUrl(): string {
  //   return this.envConfig.ETH_RPC_URL;
  // }

  // get ethWsUrl(): string {
  //   return this.envConfig.ETH_WS_URL;
  // }
  // get ethExplorer(): string {
  //   return this.envConfig.ETH_EXPLORER;
  // }
  // get bscExplorer(): string {
  //   return this.envConfig.BSC_EXPLORER;
  // }
  // get bscExplorerApiKey(): string {
  //   return this.envConfig.BSC_EXPLORER_API_KEY;
  // }
  // get ethChain(): string {
  //   return this.envConfig.ETH_CHAIN;
  // }
  // get ethChainId(): string {
  //   return this.envConfig.ETH_CHAIN_ID;
  // }

  // get bscChain(): string {
  //   return this.envConfig.BSC_EXPLORER;
  // }
  // get bscChainId(): string {
  //   return this.envConfig.ETH_CHAIN;
  // }

  get encryptionIv(): string {
    return this.envConfig.ENCRYTPION_IV;
  }

  get encryptionKey(): string {
    return this.envConfig.ENCRYTPTION_KEY;
  }

  // get network(): string {
  //   return this.envConfig.NETWORK;
  // }

  // get firebaseProjectId(): string {
  //   return this.envConfig.FIREBASE_PROJECT_ID;
  // }

  // get firebasePrivateKey(): string {
  //   return this.envConfig.FIREBASE_PRIVATE_KEY;
  // }

  // get firebaseClientEmail(): string {
  //   return this.envConfig.FIREBASE_CLIENT_EMAIL;
  // }

  get sendGridKey(): string {
    return this.envConfig.SEND_GRID_KEY;
  }

  get adminEmail(): string {
    return this.envConfig.ADMIN_EMAIL;
  }

  get cardanoNode(): string {
    return this.envConfig.CARDANO_NODE;
  }

  get signerAddress(): string {
    return this.envConfig.SIGNER_ADDRESS;
  }

  get signerName(): string {
    return this.envConfig.SIGNER_NAME;
  }

  get keyHash(): string {
    return this.envConfig.KEY_HASH;
  }

  get type(): string {
    return this.envConfig.TYPE;
  }

  get policyId(): string {
    return this.envConfig.POLICY_ID;
  }
}

import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { UserModule } from 'src/api/user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  controllers: [NotificationController],
  providers: [
    // NotificationService,
    // {
    //   provide: 'FirebaseAdmin',
    //   useFactory: (config: ConfigService) => {
    //     const adminConfig: ServiceAccount = {
    //       projectId: config.get('FIREBASE_PROJECT_ID'),
    //       privateKey: config.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    //       clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
    //     };
    //     admin.initializeApp({
    //       credential: admin.credential.cert(adminConfig),
    //       databaseURL: 'https://cqr-vault-default-rtdb.firebaseio.com/',
    //     });
    //   },
    //   inject: [ConfigService],
    // },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

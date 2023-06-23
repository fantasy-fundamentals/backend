import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { Model } from 'mongoose';
import {
  NotificationEntity,
  NotificationDocument,
} from 'src/database/entities/notification.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserService } from 'src/api/user/user.service';
import { NOTIFICATION_TYPES } from './enums/notification.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async sendNotification(details: Notification, userId: string) {
    try {
      if (userId == 'ADMIN') {
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (user && user.notificationsEnabled) {
        let title = '',
          body = '',
          swapCryptoFrom,
          swapTo,
          swapAssetFrom,
          packageDetails,
          nftToken,
          subscription,
          paymentMethod,
          request;

        if (user.fcmToken) {
          await admin.messaging().sendToDevice(user.fcmToken, {
            notification: {
              title,
              body,
            },
          });
        }

        return await this.notificationModel.create({
          ...details,
          user: user._id,
          message: body,
          swapTo: swapTo?._id,
          swapCryptoFrom: swapCryptoFrom?._id,
          swapAssetFrom: swapAssetFrom?._id,
          package: packageDetails?._id,
        });
      } else {
        console.log(
          'Cannot send notification to this user. User has no registered fcm token.',
        );
        return;
      }
    } catch (err) {
      console.log(
        '🚀 ~ file: notification.service.ts ~ line 220 ~ NotificationService ~ sendNotification ~ err',
        err,
      );
    }
  }

  async generateDirectWireNotifications(
    userId: string,
    message: string,
    wireId: string,
    isRejected = false,
  ) {
    const user = await this.userService.getUserById(userId);

    if (user && user.notificationsEnabled) {
      if (user.fcmToken) {
        await admin.messaging().sendToDevice(user.fcmToken, {
          notification: {
            title: isRejected
              ? 'Direct Wire Rejected'
              : 'Direct Wire Completed',
            body: message,
          },
        });
      }
      return await this.notificationModel.create({
        user: userId,
        message,
        direcWire: wireId,
        type: NOTIFICATION_TYPES.DIRECT_WIRE,
      });
    }
  }

  async generateGenericNotification(
    payload: NotificationEntity,
    title: string,
  ) {
    const user = await this.userService.getUserById(payload.user);
    if (user && user.notificationsEnabled) {
      if (user.fcmToken) {
        await admin.messaging().sendToDevice(user.fcmToken, {
          notification: {
            title: title,
          },
        });
      }
      return await this.notificationModel.create(payload);
    }
  }

  async getUserNotifications(user: UserEntity) {
    return await this.notificationModel
      .find({ user: user?._id, type: { $ne: NOTIFICATION_TYPES.CHAT } })
      .populate({
        path: 'chatRoom swapAssetFrom swapCryptoFrom swapTo NFT',
      })
      .sort({ createdAt: -1 });
  }
}

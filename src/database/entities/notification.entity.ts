import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NOTIFICATION_TYPES } from 'src/api/notification/enums/notification.enum';
import { UserEntity } from './user.entity';

export type NotificationDocument = NotificationEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class NotificationEntity {
  _id?: any;

  @Prop({ ref: UserEntity.name })
  user?: string;

  @Prop()
  message?: string;

  @Prop()
  type: NOTIFICATION_TYPES;

  @Prop()
  chatFrom?: string;

  @Prop()
  swapFromName?: string;

  @Prop()
  swapToName?: string;

  @Prop()
  swapAmount?: string;

  @Prop()
  loanAmount?: number;

  @Prop()
  nftAmount?: number;

  @Prop({ ref: UserEntity.name })
  balanceReceivedFrom?: string;

  @Prop()
  receiveAmount?: number;
}

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationEntity);

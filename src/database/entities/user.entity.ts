import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { Document } from 'mongoose';
import { Role, UserTypes } from 'src/api/auth/enums/role.enum';

export type UserDocument = UserEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class UserEntity {
  _id?: any;

  @Prop({ default: false })
  sdira: boolean;

  @Prop({ default: false })
  isImported: boolean;

  @Prop()
  iva: string;

  @IsEnum(UserTypes, { always: true })
  @Prop({ default: UserTypes.CQR_USER })
  type: UserTypes;

  @Prop()
  name: string;

  @Prop({ unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  profilePicture: string;

  @Prop({ default: Role.USER })
  role: string;

  @Prop()
  twoFaSecret: string;

  @Prop({ default: false })
  isTwoFaEnabled: boolean;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: false })
  isWalletActivated: boolean;

  @Prop({ default: false })
  isCustomer: boolean;

  @Prop({ default: false })
  isSubscriber: boolean;

  @Prop({ default: false })
  block: boolean;

  @Prop()
  clientId: string;

  @Prop({ default: false })
  onlineStatus: boolean;

  @Prop({ required: false })
  fcmToken: string;

  @Prop({ default: true })
  notificationsEnabled: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  blockReason: string;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ type: String, required: true, default: '' })
  affiliateCode: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

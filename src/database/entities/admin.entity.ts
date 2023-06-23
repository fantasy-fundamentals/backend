import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role, AdminPermissions } from 'src/api/auth/enums/role.enum';

export type AdminDocument = AdminEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class AdminEntity {
  _id?: any;

  @Prop()
  name: string;

  @Prop({ unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: 0 })
  profitBalance: number;

  @Prop({ default: null })
  profitAddress: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  blockReason: string;

  @Prop({ default: Role.ADMIN })
  role: string;

  @Prop({ type: Array, default: AdminPermissions.ALL })
  adminPermissions: [];

  @Prop()
  twoFaSecret: string;

  @Prop({ default: false })
  isTwoFaEnabled: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(AdminEntity);

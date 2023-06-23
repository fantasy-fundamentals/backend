import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PasswordResetDocument = PasswordResetEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PasswordResetEntity {
  @Prop()
  email: string;

  @Prop()
  code: string;
}

export const PasswordResetSchema =
  SchemaFactory.createForClass(PasswordResetEntity);

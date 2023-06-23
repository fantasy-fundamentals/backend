import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AdminDocument = AdminEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class AdminEntity {
  _id?: any;

  @Prop()
  email: string;

  @Prop()
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(AdminEntity);

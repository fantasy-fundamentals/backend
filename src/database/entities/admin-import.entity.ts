import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AdminImportDocument = AdminImportEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class AdminImportEntity {
  _id?: any;

  @Prop({ type: 'Array' })
  data: Array<any>;
}

export const AdminImportSchema =
  SchemaFactory.createForClass(AdminImportEntity);

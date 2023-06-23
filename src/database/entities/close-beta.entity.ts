import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CloseBetaDocument = CloseBetaEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class CloseBetaEntity {
  _id?: any;

  @Prop()
  email: string;

  @Prop()
  walletAddress: string;

  @Prop()
  discord: string;
}

export const CloseBetaSchema = SchemaFactory.createForClass(CloseBetaEntity);

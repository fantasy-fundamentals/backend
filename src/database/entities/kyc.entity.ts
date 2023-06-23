import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type KycDocument = KycEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class KycEntity {
  _id?: any;

  @Prop()
  firstname: string;

  @Prop()
  lastName: string;

  @Prop()
  telegram: string;

  @Prop()
  role: string;

  @Prop()
  website: string;

  @Prop({ default: false })
  status: boolean;

  @Prop()
  userAddress: string;

  @Prop()
  domain: string;

  @Prop({ type: 'Object' })
  trx: Object;
}

export const KycSchema = SchemaFactory.createForClass(KycEntity);

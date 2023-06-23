import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PROMOTION_STATUS, PROMOTION_TYPE } from 'src/utils/misc/enum';

export type PromoteDocument = PromoteEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PromoteEntity {
  _id?: any;

  @Prop()
  email: string;

  @Prop()
  coinSymbol?: string;

  @Prop({ type: 'Object' })
  coin?: Object;

  @Prop({ type: String })
  type: PROMOTION_TYPE;

  @Prop()
  dates: [];

  @Prop({ type: String, default: PROMOTION_STATUS.PENDING })
  status: PROMOTION_STATUS;

  @Prop()
  mediaUrl: string;

  @Prop()
  externalLink: string;

  @Prop({ type: {} })
  paymentTransaction: object;
}

export const PromoteSchema = SchemaFactory.createForClass(PromoteEntity);

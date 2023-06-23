import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TRANSACTION_LOG } from 'src/utils/misc/enum';
import { UserEntity } from './user.entity';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { NftEntity } from './nft.entity';

export type TransactionLogDocument = TransactionLog &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class TransactionLog {
  @Prop({ type: String })
  type: TRANSACTION_LOG;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UserEntity',
  })
  user: UserEntity;

  @Prop()
  amount: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'NftEntity',
  })
  nft: NftEntity;
}

export const TransactionLogSchema =
  SchemaFactory.createForClass(TransactionLog);

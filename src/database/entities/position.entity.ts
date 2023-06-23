import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PositionDocument = PositionEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PositionEntity {
  _id?: any;

  @Prop()
  title: string;

  @Prop()
  winStages: number;

  @Prop()
  adminFeePercentage: number;

  @Prop()
  winPercentages: number[];

  @Prop()
  losersDeductionPercentage: number;

  @Prop({ default: true })
  active: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(PositionEntity);

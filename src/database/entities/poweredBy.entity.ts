import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { POWERED_BY } from 'src/utils/misc/enum';

export type PoweredByDocument = PoweredBy &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class PoweredBy {
  _id?: any;

  @Prop({ default: POWERED_BY.partner })
  type: POWERED_BY;

  @Prop()
  link: string;

  @Prop()
  mediaLink: string;
}

export const PoweredBySchema = SchemaFactory.createForClass(PoweredBy);

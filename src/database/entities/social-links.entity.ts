import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SocialLinkDocuments = SocialLinkEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class SocialLinkEntity {
  _id?: any;

  @Prop()
  facebook: string;

  @Prop()
  linkedin: string;

  @Prop()
  github: string;

  @Prop()
  instagram: string;
}

export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinkEntity);

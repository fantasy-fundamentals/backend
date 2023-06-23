import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProjectArticleDocument = ProjectArticleEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class ProjectArticleEntity {
  _id?: any;

  @Prop()
  title: string;

  @Prop({ type: String })
  slug: string;

  @Prop()
  summary: string;

  @Prop()
  mediaUrl: string;

  @Prop({ type: 'Object' })
  socialLinks: object;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProjectArticleSchema =
  SchemaFactory.createForClass(ProjectArticleEntity);

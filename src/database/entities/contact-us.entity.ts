import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ContactUsDocument = ContactUs &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class ContactUs {
  _id?: any;

  @Prop()
  image: string;

  @Prop()
  subject: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  message: string;

  @Prop({ type: Boolean, default: false })
  isReplied?: boolean;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';

export type SettingsDocument = SettingsEntity &
  Document & {
    _id?: any;
  };

@Schema({ timestamps: true })
export class SettingsEntity {
  _id?: any;

  @Prop()
  privacyPolicy: string;

  @Prop({ default: false })
  maintenance: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsEntity);

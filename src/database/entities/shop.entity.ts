import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopDocument = ShopEntity & Document;

export type ProductVariant = {
  size: string;
  stock: number;
  price: number;
}

@Schema({ timestamps: true })
export class ShopEntity {
  @Prop({ type: String, trim: true, required: true })
  title: string;

  @Prop({ type: Array, required: true })
  images: string[];

  @Prop({ type: Boolean, isRequired: true })
  hasVariants: boolean;

  @Prop({ type: Array, required: false })
  availableVariants?: ProductVariant[];

  @Prop({ type: Number, required: false })
  price?: number;

  @Prop({ type: Number, required: false })
  stock?: number;

  @Prop({ type: Boolean, default: true, required: false })
  isActive: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(ShopEntity);

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsUrl,
  ValidateNested,
  ValidateIf,
  IsMongoId
} from 'class-validator';

export class VariantDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsPositive()
  stock: number;
}


import { Transform, Type } from 'class-transformer';
export class CreateShopDto {
  @ApiProperty({ name: 'title', type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ name: 'images', type: String, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images: string[];

  @IsBoolean()
  hasVariants: boolean;

  @ApiPropertyOptional({
    name: 'availableVariants',
    type: VariantDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => VariantDto)
  @ValidateIf((o) => o.hasVariants === true)
  availableVariants?: VariantDto[];

  @ApiPropertyOptional({ name: 'price', type: Number })
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.hasVariants === false)
  price?: number;

  @ApiPropertyOptional({ name: 'stock', type: Number })
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.hasVariants === false)
  stock?: number;

  @ApiPropertyOptional({ name: 'isActive', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => obj[key] === 'true')
  isActive?: boolean;
}

export class UpdateShopDto {
  @ApiProperty({ name: 'id', type: String })
  @IsString()
  @IsMongoId()
  id: string;

  @ApiProperty({ name: 'title', type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ name: 'images', type: String, isArray: true })
  @IsArray({ each: true })
  @ValidateNested()
  @ArrayMinSize(1)
  @IsUrl()
  images: string[];

  @ApiProperty({ name: 'hasVariants', type: Boolean })
  @IsBoolean()
  @Transform(({ obj, key }) => obj[key] === 'true')
  hasVariants: boolean;

  @ApiPropertyOptional({
    name: 'availableVariants',
    type: VariantDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => VariantDto)
  @ValidateIf((o) => o.hasVariants === true)
  availableVariants?: VariantDto[];

  @ApiPropertyOptional({ name: 'price', type: Number })
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.hasVariants === false)
  price?: number;

  @ApiPropertyOptional({ name: 'stock', type: Number })
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.hasVariants === false)
  stock?: number;

  @ApiPropertyOptional({ name: 'isActive', type: Boolean })
  @IsBoolean()
  @IsOptional()
  @Transform(({ obj, key }) => obj[key] === 'true')
  isActive?: boolean;
}

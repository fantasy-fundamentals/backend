import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
  IsString,
  ArrayMinSize,
  IsMongoId,

} from 'class-validator';
import { CurrencyEnum } from 'src/shared/enums/currency.enum';
import { Item } from 'paypal-rest-sdk';
import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, type: String, enum: CurrencyEnum })
  @IsString()
  @IsEnum(CurrencyEnum)
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsPositive()
  price;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsPositive()
  quantity;
}


export class CreatePaypalPaymentDto {
  @ApiProperty({ enum: CurrencyEnum, required: true, type: String })
  @IsString()
  @IsEnum(CurrencyEnum)
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ required: true, type: String })
  @IsString()
  @IsNotEmpty()
  total: string;

  @ApiProperty({ required: true, type: ItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ItemDto)
  items: Item[];
}
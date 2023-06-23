import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from 'src/shared/enums/payment-methods.enum';
import { PaymentType } from 'src/shared/enums/payment-types.enum';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePaypalPaymentDto } from 'src/api/paypal/models/create-payment.dto';

export class CreateNftOrderDto extends CreatePaypalPaymentDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsMongoId()
  nftId: string;

  @ApiProperty({ name: 'paymentMethod', enum: PaymentMethod })
  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ name: 'walletAddress' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ name: 'countOfNftToMint', type: Number, required: true })
  @IsNumber()
  @IsPositive()
  countOfNftToMint: number;

  @ApiProperty({ name: 'paymentType', enum: PaymentType })
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType: string;
}

export class CreateNftOrderDtoViaWalletDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsMongoId()
  nftId: string;

  @ApiProperty({ name: 'paymentMethod', enum: PaymentMethod })
  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ name: 'walletAddress' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionNumberOrHash: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ name: 'countOfNftToMint', type: Number, required: true })
  @IsNumber()
  @IsPositive()
  countOfNftToMint: number;

  @ApiProperty({ name: 'paymentType', enum: PaymentType })
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType: string;
}

export class CreateNftOrderDtoViaStripeDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsMongoId()
  nftId: string;

  @ApiProperty({ name: 'paymentMethod', enum: PaymentMethod })
  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ name: 'walletAddress' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionNumberOrHash: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ name: 'countOfNftToMint', type: Number, required: true })
  @IsNumber()
  @IsPositive()
  countOfNftToMint: number;

  @ApiProperty({ name: 'paymentType', enum: PaymentType })
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType: string;
}

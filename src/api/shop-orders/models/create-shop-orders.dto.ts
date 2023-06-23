import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateIf, IsMongoId, IsEnum } from "class-validator";
import { CreatePaypalPaymentDto } from "src/api/paypal/models/create-payment.dto";
import { PaymentMethod } from "src/shared/enums/payment-methods.enum";
import { PaymentType } from "src/shared/enums/payment-types.enum";

export class CreateShopOrderDTO extends CreatePaypalPaymentDto {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty({ name: 'walletAddress' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ name: 'productId', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ name: 'productVariantBought', required: true, type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  productVariantBought: boolean;

  @ApiProperty({ name: 'productTitle', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  productTitle: string;

  @ApiPropertyOptional({ name: 'productSize', required: false, type: String })
  @ValidateIf((o) => o.productVariantBought === true)
  @IsString()
  @IsNotEmpty()
  productSize?: string;

  @ApiProperty({ name: 'productPrice', required: true, type: Number })
  @IsNumber()
  @IsPositive()
  productPrice: number;

  @ApiProperty({ name: 'paymentMethod', enum: PaymentMethod })
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ name: 'paymentType', enum: PaymentType })
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: string;
}

export class CreateShopOrderViaWalletDTO {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty({ name: 'walletAddress' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ name: 'productId', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ name: 'productVariantBought', required: true, type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  productVariantBought: boolean;

  @ApiProperty({ name: 'productTitle', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  productTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionNumberOrHash: string;

  @ApiPropertyOptional({ name: 'productSize', required: false, type: String })
  @ValidateIf((o) => o.productVariantBought === true)
  @IsString()
  @IsNotEmpty()
  productSize?: string;

  @ApiProperty({ name: 'productPrice', required: true, type: Number })
  @IsNumber()
  @IsPositive()
  productPrice: number;

  @ApiProperty({ name: 'paymentMethod', enum: PaymentMethod })
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @ApiProperty({ name: 'paymentType', enum: PaymentType })
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: string;
}
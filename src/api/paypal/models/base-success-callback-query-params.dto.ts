import { IsNotEmpty, IsString } from 'class-validator';

export class PaypalSuccessCallbackBaseQueryParamsDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  PayerID: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
import { IsNotEmpty, IsString } from 'class-validator';
import { PaypalSuccessCallbackBaseQueryParamsDto } from 'src/api/paypal/models/base-success-callback-query-params.dto';

export class NftOrderPaypalSuccessCallbackQueryParamsDto extends PaypalSuccessCallbackBaseQueryParamsDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  secret: string;
}
import { PaypalSuccessCallbackBaseQueryParamsDto } from "./base-success-callback-query-params.dto";
import { CreatePaypalPaymentDto } from "./create-payment.dto";
import { PaypalRedirectUrl } from "./redirect-url.type";

export type BaseParams = keyof typeof PaypalSuccessCallbackBaseQueryParamsDto;

export interface PaypalPayable {
  generateIntent(body: CreatePaypalPaymentDto): Promise<string>;
  handleSuccessCallback(query: any): Promise<void>;
  handlePaymentSaleCompleted(payment: string): Promise<void>;
}
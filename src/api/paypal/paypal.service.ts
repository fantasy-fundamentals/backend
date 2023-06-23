import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as Paypal from 'paypal-rest-sdk';
import { CreatePaypalPaymentDto } from './models/create-payment.dto';
import { PaypalRedirectUrl } from './models/redirect-url.type';
@Injectable()
export class PaypalService {
  constructor(
    private readonly configService: ConfigService
  ) {
    this.configurePaypal();
  }

  private configurePaypal() {
    Paypal.configure({
      ...this.configService.PaypalConfig,
    });
  }

  public async verifyPaymentById(paymentId: string): Promise<Paypal.PaymentResponse> {
    return new Promise((resolve, reject) => {
      Paypal.payment.get(paymentId, function (error, payment) {
        if (error) return Promise.reject();
        return resolve(payment)
      })
    })
  }

  public async generateIntent(body: CreatePaypalPaymentDto, redirectUrl: PaypalRedirectUrl): Promise<Paypal.PaymentResponse> {
    const { total, currency, items } = body;

    const createPaymentObject: Paypal.Payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: redirectUrl.return_url,
        cancel_url: redirectUrl.cancel_url,
      },
      transactions: [
        {
          item_list: {
            items: items,
          },
          amount: {
            currency: currency,
            total: total,
          }
        }
      ]
    }

    return new Promise((resolve, reject) => {
      Paypal.payment.create(createPaymentObject, async function (error, payment) {
        if (error) return reject('Failed to create Paypal payment intent');
        return resolve(payment);
      });
    })
  }

  public async executePayment(paymentId: string, executePaypmentPayload: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Paypal.payment.execute(
        paymentId,
        executePaypmentPayload,
        async function (error, response) {
          if (response) return resolve('Success');
          return reject('Failed');
        }
      );
    })
  }
}

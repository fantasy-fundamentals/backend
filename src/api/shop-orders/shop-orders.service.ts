import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { PaypalService } from '../paypal/paypal.service';
import { OrderStatus } from './models/shop-order-status.enum';
import { ShopOrderPaypalSuccessCallbackQueryParamsDto } from './models/shop-order-paypal-success-callback-query-params.dto';
import { PaypalPayable } from '../paypal/models/payment.interface';
import { PaypalRedirectUrl } from '../paypal/models/redirect-url.type';
import { Connection } from 'mongoose';
import { generateRandomSecret } from 'src/shared/helpers/generate-random-string.helper';
import { ShopOrderDocument, ShopOrderEntity } from 'src/database/entities/shop-order.entity';
import { CreateShopOrderDTO, CreateShopOrderViaWalletDTO } from './models/create-shop-orders.dto';
import { ShopService } from '../shop/shop.service';
import { rejects } from 'assert';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ShopOrdersService implements PaypalPayable {
  constructor(
    @InjectModel(ShopOrderEntity.name)
    private readonly shopOrderModel: Model<ShopOrderDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly paypalService: PaypalService,
    private readonly shopService: ShopService,
    private readonly configService: ConfigService
  ) { }

  async generateIntent(body: CreateShopOrderDTO): Promise<string> {
    const secret = generateRandomSecret();
    const { currency, total, items, ...shopOrderPayload } = body;
    const BACKEND_URL = this.configService.backendUrl;

    const eitherShopOrNull = await this.shopService.findById(body.productId);
    if (eitherShopOrNull === null) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (body.productVariantBought === true) {
      for (const productVariant of eitherShopOrNull.availableVariants) {
        const { size, stock } = productVariant;
        if (size === body.productSize && stock === 0) {
          throw new HttpException('Product out of stock', HttpStatus.BAD_REQUEST);
        }
      }
    } else {
      if (eitherShopOrNull.stock === 0) {
        throw new HttpException('Product out of stock', HttpStatus.BAD_REQUEST);
      }
    }

    const redirectUrls: PaypalRedirectUrl = {
      return_url: `${BACKEND_URL}/shop-orders/paypal/success?secret=${secret}&walletAddress=${body.walletAddress}`,
      cancel_url: `${BACKEND_URL}/shop-orders/paypal/cancel`
    }

    const payment = await this.paypalService.generateIntent(body, redirectUrls)
    const createdOrder = await this.shopOrderModel.create({
      ...shopOrderPayload,
      secret,
      transactionNumberOrHash: payment.id,
      amount: body.total,
      paymentMethod: 'card',
      paymentType: 'Paypal',
    })

    if (createdOrder === null) {
      throw new HttpException(
        'Failed to create order',
        400
      )
    }

    let redirectUrl = '';
    for (let i = 0; i < payment.links.length; i++) {
      if (payment.links[i].rel === 'approval_url') {
        redirectUrl = payment.links[i].href;
      }
    }

    return redirectUrl;
  }

  async handleSuccessCallback(query: ShopOrderPaypalSuccessCallbackQueryParamsDto): Promise<any> {
    const { paymentId, PayerID } = query;
    const eitherOrderOrNull = await this.shopOrderModel.findOne({
      secret: query.secret,
      walletAddress: query.walletAddress,
      status: OrderStatus.Pending,
      paymentId
    });

    if (eitherOrderOrNull === null) return Promise.reject();

    let payment = null;
    try {
      payment = await this.paypalService.verifyPaymentById(paymentId);
    } catch (e) {
      return Promise.reject();
    }

    // Stock availability Validation
    const product = await this.shopService.findById(eitherOrderOrNull.productId);
    if (eitherOrderOrNull.productVariantBought === true) {
      for (const productVariant of product.availableVariants) {
        const { size, stock } = productVariant;
        if (size === eitherOrderOrNull.productSize && stock === 0) {
          return Promise.reject('Product out of stock');
        }
      }
    } else {
      if (product.stock === 0) {
        return Promise.reject('Product out of stock');
      }
    }

    if (payment.state === 'created') {
      const executePaypmentPayload = {
        payer_id: PayerID,
        transactions: [{
          amount: {
            currency: "USD",
            total: eitherOrderOrNull.amount
          }
        }]
      }

      return this
        .paypalService
        .executePayment(paymentId, executePaypmentPayload)
        .then(async (success) => {
          eitherOrderOrNull.status = OrderStatus.Processing;
          eitherOrderOrNull.secret = null;
          await eitherOrderOrNull.save();

          return Promise.resolve('Payment completed successfully');
        })
        .catch((e) => {
          return Promise.reject();
        })
    }
  }

  async handlePaymentSaleCompleted(paymentId: string): Promise<any> {
    const transactionSession = await this.connection.startSession();
    try {
      await transactionSession.startTransaction();
      const eitherOrderOrNull = await this.shopOrderModel.findOne({ status: OrderStatus.Processing, paymentId });

      if (eitherOrderOrNull === null) return Promise.reject()

      // Stock availability Validation
      let isOrderNeedsToBeRefunded = false;
      const product = await this.shopService.findById(eitherOrderOrNull.productId);
      if (eitherOrderOrNull.productVariantBought === true) {
        product.availableVariants = product.availableVariants.map((productVariant) => {
          const { size, stock } = productVariant;
          if (size === eitherOrderOrNull.productSize) {
            if (stock === 0) {
              isOrderNeedsToBeRefunded = true;
            } else {
              productVariant = {
                ...productVariant,
                stock: productVariant.stock - 1
              }
            }
          }
          return productVariant;
        });
      } else {
        if (product.stock === 0) {
          isOrderNeedsToBeRefunded = true;
        } else {
          product.stock = product.stock - 1;
        }
      }
      await product.save();

      if (isOrderNeedsToBeRefunded) {
        eitherOrderOrNull.status = OrderStatus.Cancelled;
        eitherOrderOrNull.needsToBeRefunded = true;
        await eitherOrderOrNull.save();
        return Promise.resolve();
      }

      eitherOrderOrNull.status = OrderStatus.Completed;
      await eitherOrderOrNull.save();
      await transactionSession.commitTransaction();
      return Promise.resolve();
    } catch (e) {
      await transactionSession.abortTransaction();
      return Promise.reject();
    } finally {
      await transactionSession.endSession();
    }
  }

  async payViaWallet(body: CreateShopOrderViaWalletDTO) {
    const transactionSession = await this.connection.startSession();

    try {
      // If product is not found, throw the exception
      const product = await this.shopService.findById(body.productId);
      if (product === null) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      // Start transaction
      await transactionSession.startTransaction();

      // Create an order
      const createdOrder = await this.shopOrderModel.create(body);

      let isOrderNeedsToBeRefunded = false;
      if (body.productVariantBought === true) {
        product.availableVariants = product.availableVariants.map((productVariant) => {
          const { size, stock } = productVariant;
          if (size === body.productSize) {
            if (stock === 0) {
              isOrderNeedsToBeRefunded = true;
            } else {
              productVariant = {
                ...productVariant,
                stock: productVariant.stock - 1
              }
            }
          }
          return productVariant;
        });
      } else {
        if (product.stock === 0) {
          isOrderNeedsToBeRefunded = true;
        } else {
          product.stock = product.stock - 1;
        }
      }
      await product.save();

      if (isOrderNeedsToBeRefunded) {
        createdOrder.status = OrderStatus.Cancelled;
        createdOrder.needsToBeRefunded = true;
        await createdOrder.save();
        throw new HttpException('Product out of stock. Your payment will be refunded soon.', HttpStatus.BAD_REQUEST);
      }

      createdOrder.status = OrderStatus.Completed;
      await createdOrder.save();
      await transactionSession.commitTransaction();
      return {
        message: 'Order completed successfully'
      }
    } catch (e) {
      await transactionSession.abortTransaction();
      throw e;
    } finally {
      await transactionSession.endSession();
    }
  }

  async get(query: PaginationDto): Promise<{
    data: ShopOrderDocument[] | [],
    total: number
  }> {
    const page = query.page || DEFAULT_PAGINATION_PAGE;
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const skip = page * limit;

    const data = await this.shopOrderModel
      .find({})
      .sort({ createdAt: 'descending' })
      .skip(skip)
      .limit(limit);
    const total = await this.shopOrderModel.countDocuments();

    return { data, total };
  }
}

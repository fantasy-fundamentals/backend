import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NftOrderDocument, NftOrderEntity } from 'src/database/entities/nft-order.entity';
import Stripe from 'stripe';
import { CreateNftOrderDto } from '../nft-orders/models/create-nft-order.dto';
import { Model } from 'mongoose';
import { NftOrderService } from '../nft-orders/nft-order.service';
import { UserAndMintedNftDocument, UserAndMintedNftEntity } from 'src/database/entities/user-and-minted-nfts.entity';
import { BadRequestException } from '@nestjs/common';
import { CryptoPaymentDto, PaymentDto } from './dto/payment.dto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(NftOrderEntity.name)
    private readonly orderModel: Model<NftOrderDocument>,
    private readonly nftOrderService: NftOrderService,
    @InjectModel(UserAndMintedNftEntity.name)
    private userAndMintedNftModel: Model<UserAndMintedNftDocument>
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
      apiVersion: '2020-08-27',
    })
  }

  stripePayment({ price, currency }: PaymentDto): Promise<any> {
    return this.stripe.paymentIntents.create({
      amount: price * 100,
      currency: currency,
    });
  }



  validate = async ({ trx, userAddress, systemAddress, amount }) => {
    try {
      const url = `https://cardano-preprod.blockfrost.io/api/v0/txs/${trx}/utxos`;
      const projectId = 'preproduAvktr9NsXx92xq7t3EiTVQ9bo0f9jHJ';
      axios.defaults.headers.common['project_id'] = projectId;
      const { data } = await axios.get(url);

      if (
        data.inputs[0]['address'].toLowerCase() === userAddress.toLowerCase()
      ) {
        let found = null;
        for (let index = 0; index < data.outputs.length; index++) {
          const element = data.outputs[index];
          if (
            element.address.toLowerCase() === systemAddress.toLowerCase() &&
            +element.amount[0]['quantity'] === +amount
          ) {
            found = true;
          }
        }
        return found;
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Payment not received yet!');
    }
  };

  async crypto(payload: CryptoPaymentDto): Promise<any> {
    try {
      const validate = await this.validate(payload);
      if (validate) {
        // add order
        // mind nft and transfer ownership to recipient user
      }
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }
}

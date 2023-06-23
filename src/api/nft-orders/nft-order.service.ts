import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NftOrderEntity,
  NftOrderDocument,
} from 'src/database/entities/nft-order.entity';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
  PaginationDto,
} from 'src/shared/DTOs/paginated-page-limit.dto';
import { PaymentType } from 'src/shared/enums/payment-types.enum';
import { PaypalService } from '../paypal/paypal.service';
import { OrderStatus } from './models/nft-order-status.enum';
import {
  CreateNftOrderDto,
  CreateNftOrderDtoViaWalletDto,
} from './models/create-nft-order.dto';
import { NftOrderPaypalSuccessCallbackQueryParamsDto } from './models/nft-order-paypal-success-callback-query-params.dto';
import { PaypalPayable } from '../paypal/models/payment.interface';
import { PaypalRedirectUrl } from '../paypal/models/redirect-url.type';
import { Connection } from 'mongoose';
import {
  UserAndMintedNftDocument,
  UserAndMintedNftEntity,
} from 'src/database/entities/user-and-minted-nfts.entity';
import { generateRandomSecret } from 'src/shared/helpers/generate-random-string.helper';
import { NftService } from '../nft/nft.service';
import { ConfigService } from 'src/config/config.service';
import { TRANSACTION_LOG } from 'src/utils/misc/enum';
import { TransactionLogService } from '../transactionLog/transactionLog.service';
import {
  PlayerDocument,
  PlayerEntity,
} from 'src/database/entities/player.entity';
var ObjectId = require('mongodb').ObjectId;

@Injectable()
export class NftOrderService implements PaypalPayable {
  constructor(
    @InjectModel(NftOrderEntity.name)
    private readonly nftOrderModel: Model<NftOrderDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly paypalService: PaypalService,
    @InjectModel(UserAndMintedNftEntity.name)
    private readonly userAndMintedNftModel: Model<UserAndMintedNftDocument>,
    private readonly nftService: NftService,
    private readonly configService: ConfigService,

    @InjectModel(PlayerEntity.name)
    private readonly playerModal: Model<PlayerDocument>,

    @Inject(forwardRef(() => TransactionLogService))
    private readonly transactionLogService,
  ) {}

  async generateIntent(body: CreateNftOrderDto): Promise<string> {
    const BACKEND_URL = this.configService.backendUrl;

    const secret = generateRandomSecret();
    const { nftId, userId, walletAddress, total } = body;
    const redirectUrls: PaypalRedirectUrl = {
      return_url: `${BACKEND_URL}/nft-orders/paypal/success?secret=${secret}&walletAddress=${body.walletAddress}`,
      cancel_url: `${BACKEND_URL}/nft-orders/paypal/cancel`,
    };

    const eitherNftOrNull = await this.nftService.findById(nftId);
    if (eitherNftOrNull === null) {
      throw new HttpException('Nft not found', HttpStatus.NOT_FOUND);
    }

    const payment = await this.paypalService.generateIntent(body, redirectUrls);
    const createdOrder = await this.nftOrderModel.create({
      nftId,
      userId,
      walletAddress,
      secret,
      transactionNumberOrHash: payment.id,
      amount: total,
      countOfNftToMint: body.countOfNftToMint,
      paymentMethod: 'card',
      paymentType: 'Paypal',
    });

    if (createdOrder === null) {
      throw new HttpException('Failed to create order', 400);
    }

    let redirectUrl = '';
    for (let i = 0; i < payment.links.length; i++) {
      if (payment.links[i].rel === 'approval_url') {
        redirectUrl = payment.links[i].href;
      }
    }

    return redirectUrl;
  }

  async handleSuccessCallback(
    query: NftOrderPaypalSuccessCallbackQueryParamsDto,
  ): Promise<any> {
    const { paymentId, PayerID } = query;
    const eitherOrderOrNull = await this.nftOrderModel.findOne({
      secret: query.secret,
      walletAddress: query.walletAddress,
      status: OrderStatus.Pending,
      paymentId,
    });

    if (eitherOrderOrNull === null) {
      return Promise.reject();
    }

    let payment = null;
    try {
      payment = await this.paypalService.verifyPaymentById(paymentId);
    } catch (e) {
      return Promise.reject();
    }

    if (payment.state === 'created') {
      const executePaypmentPayload = {
        payer_id: PayerID,
        transactions: [
          {
            amount: {
              currency: 'USD',
              total: eitherOrderOrNull.amount,
            },
          },
        ],
      };

      return this.paypalService
        .executePayment(paymentId, executePaypmentPayload)
        .then(async (success) => {
          eitherOrderOrNull.status = OrderStatus.Processing;
          eitherOrderOrNull.secret = null;
          await eitherOrderOrNull.save();
          return Promise.resolve('Payment completed successfully');
        })
        .catch((e) => {
          return Promise.reject();
        });
    }
  }

  async handlePaymentSaleCompleted(paymentId: string): Promise<any> {
    const transactionSession = await this.connection.startSession();
    try {
      await transactionSession.startTransaction();

      // Return the rejected promise if Order is not found
      const eitherOrderOrNull = await this.nftOrderModel.findOne({
        status: OrderStatus.Processing,
        paymentId,
      });
      if (eitherOrderOrNull === null) return Promise.reject();

      // Get required data from the order
      const { walletAddress, userId, nftId, amount } = eitherOrderOrNull;

      // Return the rejected promise if Nft is not found
      const eitherNftOrNull = await this.nftService.findById(nftId);
      if (eitherNftOrNull === null) return Promise.reject();

      // Mint the NFT, get transaction Hash and saved minted Nft info in our database
      const playerDetail: any = eitherNftOrNull.playerDetail;
      const nftVideoUrlSplitter = 'cloudfront.net';
      let videoUrlArr = [];

      if (eitherNftOrNull.meta.videoUrl.includes(nftVideoUrlSplitter)) {
        const [nftVideoUrlFirstPart, nftVideoUrlSecondPart] =
          eitherNftOrNull.meta.videoUrl.split(nftVideoUrlSplitter);
        videoUrlArr = [
          nftVideoUrlFirstPart,
          nftVideoUrlSplitter,
          nftVideoUrlSecondPart,
        ];
      } else {
        videoUrlArr = [eitherNftOrNull?.meta?.videoUrl || ''];
      }

      const mintResponse = await this.nftService.mintNFTs({
        name: playerDetail?.Name as string,
        quantity: eitherOrderOrNull.countOfNftToMint,
        videoUrl: videoUrlArr,
        playerId: String(eitherNftOrNull.playerId),
        receiverAddress: walletAddress,
      });

      var _nftId = new ObjectId(nftId);
      var _userId = new ObjectId(userId);

      await this.transactionLogService.create({
        type: TRANSACTION_LOG.mint,
        amount,
        user: _userId,
        nft: _nftId,
      });

      if (mintResponse.success === true) {
        const blockChainNftId = mintResponse.result.nftId;
        const eitherRecordFoundOrNull =
          await this.userAndMintedNftModel.findOne({
            userId,
            nftId,
            walletAddress,
          });

        if (eitherRecordFoundOrNull === null) {
          await this.userAndMintedNftModel.create({
            nftId,
            userId,
            mintedIds: [blockChainNftId],
            walletAddress,
            count: eitherOrderOrNull.countOfNftToMint,
          });
        } else {
          eitherRecordFoundOrNull.count =
            eitherRecordFoundOrNull.count + eitherOrderOrNull.countOfNftToMint;
          // eitherRecordFoundOrNull.mintedIds = Array.from(
          //   new Set([...eitherRecordFoundOrNull.mintedIds, blockChainNftId]),
          // );
          var newArr = eitherRecordFoundOrNull.mintedIds;
          newArr.push({
            id: blockChainNftId,
            quantity: eitherOrderOrNull.countOfNftToMint,
          });
          eitherRecordFoundOrNull.mintedIds = newArr;
          await eitherRecordFoundOrNull.save();
        }
      } else {
        // Logic to refund Paypal Payment
      }

      // Finally change the order status
      eitherOrderOrNull.status = OrderStatus.Completed;
      await eitherOrderOrNull.save();

      // Commit the transaction and return resolved promise
      await transactionSession.commitTransaction();
      return Promise.resolve();
    } catch (e) {
      console.log(JSON.stringify(e, undefined, 4));
      await transactionSession.abortTransaction();
      return Promise.reject();
    } finally {
      await transactionSession.endSession();
    }
  }

  async create(body: CreateNftOrderDto): Promise<NftOrderDocument> {
    return await this.nftOrderModel.create(body);
  }

  async findByPaymentIdAndStatus(status, transactionNumberOrHash) {
    return await this.nftOrderModel.findOne({
      status,
      transactionNumberOrHash,
    });
  }

  async findByPaymentId(
    transactionNumberOrHash: string,
  ): Promise<NftOrderDocument> {
    return await this.nftOrderModel.findOne({ transactionNumberOrHash });
  }

  async get(query: PaginationDto): Promise<{
    data: NftOrderDocument[] | [];
    total: number;
  }> {
    const page = query.page || DEFAULT_PAGINATION_PAGE;
    const limit = query.limit || DEFAULT_PAGINATION_LIMIT;
    const skip = page * limit;

    const data = await this.nftOrderModel
      .find({})
      .sort({ createdAt: 'descending' })
      .skip(skip)
      .limit(limit);
    const total = await this.nftOrderModel.countDocuments();

    return { data, total };
  }

  async payViaWallet(body: CreateNftOrderDtoViaWalletDto) {
    // Start Transaction
    const transactionSession = await this.connection.startSession();
    try {
      await transactionSession.startTransaction();
      const { userId, nftId, walletAddress } = body;

      // Return the rejected promise if Nft is not found
      const eitherNftOrNull = await this.nftService.findById(nftId);
      if (eitherNftOrNull === null) return Promise.reject();

      // Mint the NFT, get transaction Hash and saved minted Nft info in our database
      const playerDetail: any = eitherNftOrNull.playerDetail;
      const nftVideoUrlSplitter = 'cloudfront.net';
      let videoUrlArr = [];

      if (eitherNftOrNull.meta.videoUrl.includes(nftVideoUrlSplitter)) {
        const [nftVideoUrlFirstPart, nftVideoUrlSecondPart] =
          eitherNftOrNull.meta.videoUrl.split(nftVideoUrlSplitter);
        videoUrlArr = [
          nftVideoUrlFirstPart,
          nftVideoUrlSplitter,
          nftVideoUrlSecondPart,
        ];
      } else {
        videoUrlArr = [eitherNftOrNull?.meta?.videoUrl || ''];
      }

      console.log(videoUrlArr);

      const mintResponse = await this.nftService.mintNFTs({
        name: playerDetail?.Name as string,
        quantity: body.countOfNftToMint,
        videoUrl: videoUrlArr,
        playerId: String(eitherNftOrNull.playerId),
        receiverAddress: walletAddress,
      });

      if (mintResponse.success === true) {
        const blockChainNftId = mintResponse.result.nftId;
        const eitherRecordFoundOrNull =
          await this.userAndMintedNftModel.findOne({
            userId,
            nftId,
            walletAddress,
          });
        if (eitherRecordFoundOrNull === null) {
          await this.userAndMintedNftModel.create({
            nftId,
            userId,
            walletAddress,
            mintedIds: [
              { quantity: body.countOfNftToMint, id: blockChainNftId },
            ],
            count: body.countOfNftToMint,
            available: body.countOfNftToMint,
          });
        } else {
          eitherRecordFoundOrNull.count =
            eitherRecordFoundOrNull.count + body.countOfNftToMint;
          eitherRecordFoundOrNull.available =
            eitherRecordFoundOrNull.available + body.countOfNftToMint;

          var newArr = eitherRecordFoundOrNull.mintedIds;
          newArr.push({ id: blockChainNftId, quantity: body.countOfNftToMint });
          eitherRecordFoundOrNull.mintedIds = newArr;
          await eitherRecordFoundOrNull.save();
        }
      } else {
        // Logic to refund Crypto Payment
        throw new HttpException('Failed to mint Nft', HttpStatus.BAD_REQUEST);
      }

      // Finally create a new order, change its status and save it
      const createdOrder = await this.nftOrderModel.create({
        ...body,
        paymentMethod: 'crypto',
        paymentType: 'Crypto',
      });
      createdOrder.status = 'Completed';
      await createdOrder.save();

      var _nftId = new ObjectId(body.nftId);
      var _userId = new ObjectId(body.userId);

      let _player = await this.playerModal.findOne({
        playerId: eitherNftOrNull.playerId,
      });

      _player.isMinted = true;
      await _player.save();

      await this.transactionLogService.create({
        type: TRANSACTION_LOG.mint,
        amount: body.amount,
        user: _userId,
        nft: _nftId,
      });

      // Commit the transaction and return resolved promise
      await transactionSession.commitTransaction();
      return { message: 'NFT minted successfully' };
    } catch (e) {
      console.log(e.message);

      await transactionSession.abortTransaction();
      throw new HttpException('Failed to mint Nft', HttpStatus.BAD_REQUEST);
    } finally {
      await transactionSession.endSession();
    }
  }

  async payViaStripe(body: CreateNftOrderDtoViaWalletDto) {
    // Start Transaction
    const transactionSession = await this.connection.startSession();
    try {
      await transactionSession.startTransaction();
      const { userId, nftId, walletAddress } = body;

      // Return the rejected promise if Nft is not found
      const eitherNftOrNull = await this.nftService.findById(nftId);
      if (eitherNftOrNull === null) return Promise.reject();

      // Mint the NFT, get transaction Hash and saved minted Nft info in our database
      const playerDetail: any = eitherNftOrNull.playerDetail;
      const nftVideoUrlSplitter = 'cloudfront.net';
      let videoUrlArr = [];

      if (eitherNftOrNull.meta.videoUrl.includes(nftVideoUrlSplitter)) {
        const [nftVideoUrlFirstPart, nftVideoUrlSecondPart] =
          eitherNftOrNull.meta.videoUrl.split(nftVideoUrlSplitter);
        videoUrlArr = [
          nftVideoUrlFirstPart,
          nftVideoUrlSplitter,
          nftVideoUrlSecondPart,
        ];
      } else {
        videoUrlArr = [eitherNftOrNull?.meta?.videoUrl || ''];
      }

      const mintResponse = await this.nftService.mintNFTs({
        name: playerDetail?.Name as string,
        quantity: body.countOfNftToMint,
        videoUrl: videoUrlArr,
        playerId: String(eitherNftOrNull.playerId),
        receiverAddress: walletAddress,
      });

      if (mintResponse.success === true) {
        const blockChainNftId = mintResponse.result.nftId;
        const eitherRecordFoundOrNull =
          await this.userAndMintedNftModel.findOne({
            userId,
            nftId,
            walletAddress,
          });
        if (eitherRecordFoundOrNull === null) {
          await this.userAndMintedNftModel.create({
            nftId,
            userId,
            walletAddress,
            mintedIds: [
              { quantity: body.countOfNftToMint, id: blockChainNftId },
            ],
            count: body.countOfNftToMint,
            available: body.countOfNftToMint,
          });
        } else {
          eitherRecordFoundOrNull.count =
            eitherRecordFoundOrNull.count + body.countOfNftToMint;
          eitherRecordFoundOrNull.available =
            eitherRecordFoundOrNull.available + body.countOfNftToMint;

          var newArr = eitherRecordFoundOrNull.mintedIds;
          newArr.push({ id: blockChainNftId, quantity: body.countOfNftToMint });
          eitherRecordFoundOrNull.mintedIds = newArr;
          await eitherRecordFoundOrNull.save();
        }
      } else {
        // Logic to refund Stripe payment
      }

      // Finally create a new order, change its status and save it
      const createdOrder = await this.nftOrderModel.create({
        ...body,
        paymentMethod: 'card',
        paymentType: PaymentType.Stripe,
      });
      createdOrder.status = 'Completed';
      await createdOrder.save();

      var _nftId = new ObjectId(body.nftId);
      var _userId = new ObjectId(body.userId);

      let _player = await this.playerModal.findOne({
        playerId: eitherNftOrNull.playerId,
      });

      _player.isMinted = true;
      await _player.save();

      await this.transactionLogService.create({
        type: TRANSACTION_LOG.mint,
        amount: body.amount,
        user: _userId,
        nft: _nftId,
      });

      // Commit the transaction and return resolved promise
      await transactionSession.commitTransaction();
      return { message: 'NFT minted successfully' };
    } catch (e) {
      console.log(e.message);

      await transactionSession.abortTransaction();
      throw new HttpException('Failed to mint Nft', HttpStatus.BAD_REQUEST);
    } finally {
      await transactionSession.endSession();
    }
  }
}

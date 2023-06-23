import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Readable } from 'stream';
import { Rate, RateDocument } from '../../database/entities/rates.entity';
import { UserEntity, UserDocument } from '../../database/entities/user.entity';
import {
  WalletEntity,
  WalletDocument,
} from '../../database/entities/wallet.entity';
const XLSX = require('xlsx');
import { ConfigService } from '@nestjs/config';
import { EmailHandlerService } from 'src/api/email-handler/email-handler.service';
import { BlockUserDto } from './dto/block-user.dto';
// import { NotificationService } from 'src/api/notification/notification.service';
import { NOTIFICATION_TYPES } from 'src/api/notification/enums/notification.enum';
import { SOCKET_TYPES } from 'src/api/gateways/types/socketTypes';
import { GatewaysService } from 'src/api/gateways/gateways.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(WalletEntity.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Rate.name)
    private readonly rateModel: Model<RateDocument>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailHandlerService,
    // @Inject(forwardRef(() => NotificationService))
    // private readonly notificationService: NotificationService,
    private readonly gatewayService: GatewaysService,
  ) {}
  //
  bufferToStream(buffer) {
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async findById(_id: string) {
    return await this.userModel.findOne({ _id });
  }

  async getUserInfo(email: string) {
    const user: UserEntity = await this.userModel
      .findOne({ email: email?.toLowerCase() })
      .lean();
    if (!user) throw new NotFoundException({ message: 'user not found' });

    const wallets: WalletEntity[] = await this.walletModel
      .find({ userEmail: email })
      .lean();

    const rates: Rate[] = await this.rateModel.find({});

    const filteredWallets = wallets.map((wallet) => {
      const rate = rates.find((rate) => {
        return rate.coinSymbol === wallet.coinSymbol;
      });

      return {
        coinSymbol: wallet.coinSymbol,
        address: wallet.address,
        balance: wallet.balance,
        marketData: rate,
      };
    });

    user.password = undefined;
    return {
      user,
      wallets: [...filteredWallets],
    };
  }

  async getAllUsers() {
    return await this.userModel.find({});
  }

  async getAllUsersCount(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async getAllUsersReport(res) {
    const users = await this.userModel.find({});
    const workbook = XLSX.utils.book_new();

    const temp = [];

    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      temp.push({
        Name: element.name,
        Email: element.email,
        'Wallet Activated': element.isWalletActivated ? 'Yes' : 'No',
        'Account Type': element.type,
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(temp);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'users_export');

    const workbookOpts = { bookType: 'xlsx', type: 'buffer' };

    const resp = XLSX.write(workbook, workbookOpts);

    const stream = this.bufferToStream(resp);

    res.setHeader(
      'Content-disposition',
      `attachment; filename=Users-Export.xlsx`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    stream.pipe(res);
  }

  async activateAccount(userId: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { isWalletActivated: true },
      { new: true },
    );
  }

  async userProfile(profilePicture: string, userId: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { profilePicture },
      { new: true },
    );
  }

  async getUserById(userId: string) {
    return await this.userModel.findOne({ _id: userId });
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email: email });
  }

  async updateUserCustomerStatus(userId: string, status: boolean) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { isCustomer: status },
      { new: true },
    );
  }

  async subscribeUser(userId: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { isSubscriber: true },
      { new: true },
    );
  }

  async unSubscribeUser(userId: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { isSubscriber: false },
      { new: true },
    );
  }

  async changeNotificationStatus(user: UserEntity, status: boolean) {
    return await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { notificationsEnabled: status },
      { new: true },
    );
  }

  async handleUserLogout(user: UserEntity) {
    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { fcmToken: null },
    );

    return {
      message: 'User logout successful',
    };
  }

  async contactUs(payload) {
    try {
      const { email, firstName, lastName, phone, message } = payload;

      const mail = {
        to: this.configService.get('FROM_EMAIL'),
        subject: 'Contact us',
        from: this.configService.get('FROM_EMAIL'),
        text: `
        Name: ${firstName} ${lastName} \n
        Phone: ${phone} \n
        Email: ${email} \n
        Message: ${message}
        `,
      };

      await this.emailService.sendEmail(mail);

      return {
        message: 'Message has been sent successfully!',
      };
    } catch (err) {
      console.log(
        '🚀 ~ file: user.service.ts ~ line 237 ~ UserService ~ contactUs ~ err',
        err.response.body.errors,
      );

      throw err;
    }
  }

  async blockUserAccount(payload: BlockUserDto) {
    const updatedUser = await this.userModel.findOneAndUpdate(
      {
        _id: payload.userId,
      },
      {
        isBlocked: payload.isblocked,
        blockReason: payload.reasonToBlock,
      },
      { new: true },
    );

    if (payload.isblocked) {
      // await this.notificationService.generateGenericNotification(
      //   {
      //     user: payload.userId,
      //     message: payload.reasonToBlock,
      //     type: NOTIFICATION_TYPES.USER_BLOCK,
      //   },
      //   'Account Suspended',
      // );

      this.gatewayService.emit(
        {
          type: SOCKET_TYPES.USER_BLOCKED,
          user: updatedUser,
        },
        updatedUser.email,
      );
    }

    return {
      message: 'User account blocked successfully',
    };
  }

  async updateUserInfo(user: UserEntity, updateProfileDto: UpdateUserDto) {
    const updated = await this.userModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        ...updateProfileDto,
      },
      {
        new: true,
      },
    );

    return updated;
  }
}

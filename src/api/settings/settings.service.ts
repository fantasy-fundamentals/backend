import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from 'src/config/config.service';
import {
  SettingsDocument,
  SettingsEntity,
} from 'src/database/entities/settings.entity';
import {
  NotifyEmailDocument,
  NotifyEmailEntity,
} from 'src/database/entities/notify-email.entity';
import { MailChimpService } from 'src/utils/mailchimp.service';
import { GatewaysService } from '../gateways/gateways.service';
import { SOCKET_TYPES } from '../gateways/types/socketTypes';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SettingsEntity.name)
    private readonly settings: Model<SettingsDocument>,
    @InjectModel(NotifyEmailEntity.name)
    private readonly notifyEmailModel: Model<NotifyEmailDocument>,
    @Inject(forwardRef(() => MailChimpService))
    private readonly mailChimpService,
    private readonly config: ConfigService,
    private readonly gatewayService: GatewaysService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async maintenance(status) {
    const settingDoc = await this.settings.find({});

    const data = await this.settings.findOneAndUpdate(
      { _id: settingDoc[0]._id },
      {
        maintenance: status,
      },
      { new: true },
    );

    this.gatewayService.emit(
      {
        type: SOCKET_TYPES.SETTINGS,
        data,
      },
      SOCKET_TYPES.SETTINGS,
    );

    return 'Maintenance mode updated';
  }

  async get(): Promise<object> {
    try {
      return await this.settings.findOne();
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(payload): Promise<object> {
    try {
      const settingDoc = await this.settings.findOne();
      let data;

      if (settingDoc) {
        data = await this.settings.findOneAndUpdate(
          { _id: settingDoc._id },
          payload,
          {
            upsert: true,
            new: true,
          },
        );
      } else {
        data = await this.settings.create(payload);
      }

      this.gatewayService.emit(
        {
          type: SOCKET_TYPES.SETTINGS,
          data,
        },
        SOCKET_TYPES.SETTINGS,
      );

      return data;
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async saveNotifyEmail(email) {
    await this.notifyEmailModel.create({ email });
    await this.mailChimpService.exportToMailChimp(email);
    return {
      result: 'Email saved successfully',
    };
  }

  async showTweets(): Promise<object> {
    try {
      const response = await axios.get(
        `https://api.twitter.com/2/users/${this.config.getTwitterUserID}/tweets`,
        {
          headers: {
            Authorization: `Bearer ${this.config.getTwitterPost}`,
          },
        },
      );
      return {
        status: 201,
        result: response.data,
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getTweets(username): Promise<object> {
    try {
      const res1 = await axios.get(
        `https://api.twitter.com/2/users/by/username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.getTwitterPost}`,
          },
        },
      );

      if (res1.data.errors?.length > 0) {
        throw new BadRequestException(res1.data?.errors[0]['detail']);
      }

      if (res1) {
        const res2 = await axios.get(
          `https://api.twitter.com/2/users/${res1.data?.data?.id}/tweets?max_results=100`,
          {
            headers: {
              Authorization: `Bearer ${this.config.getTwitterPost}`,
            },
          },
        );
        return {
          status: 201,
          result: res2.data,
        };
      }
      return {
        status: 201,
        result: [],
      };
    } catch (error) {
      delete error.response;
      throw new BadRequestException(error);
    }
  }

  async coinRate(coinSymbol: string) {
    try {
      let url = `https://api.coingecko.com/api/v3/coins/${coinSymbol}`;
      const response = await axios.get(url);
      return response.data?.market_data.current_price.usd;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async environment() {
    return process.env.NODE_ENV;
  }

  async testSettings() {
    const collections = await this.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await this.connection.db.collection(collection.name).drop();
    }
  }
}

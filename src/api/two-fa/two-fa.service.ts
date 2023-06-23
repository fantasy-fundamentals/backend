import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminDocument, AdminEntity } from 'src/database/entities/admin.entity';

@Injectable()
export class TwoFaService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
  ) { }

  public async generateTwoFaSecret(user) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      secret,
    );

    await this.adminModel.findOneAndUpdate(
      { _id: user._id },
      { twoFaSecret: secret },
    );

    return {
      secret,
      otpAuthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(
      stream.setHeader(`content-type`, `image/png`),
      otpAuthUrl,
    );
  }

  async enableTwoFa(userId: string) {
    return await this.adminModel.findOneAndUpdate(
      {
        _id: userId,
      },
      { isTwoFaEnabled: true },
    );
  }

  public async isTwoFaCodeValid(
    twoFaCode: string,
    userId: string,
  ): Promise<boolean> {
    const admin = await this.adminModel.findOne({
      _id: userId
    });
    return admin.twoFaSecret == twoFaCode
  }

  public async resetTwoFaSecret(adminId: string) {
    return await this.adminModel.findOneAndUpdate(
      {
        _id: adminId
      },
      { twoFaSecret: null }
    )
  }
}

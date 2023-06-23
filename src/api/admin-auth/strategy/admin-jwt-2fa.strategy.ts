import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/api/auth/strategy/jwt-payload.interface';
import { AdminEntity, AdminDocument } from 'src/database/entities/admin.entity';

@Injectable()
export class AdminJwt2FaStrategy extends PassportStrategy(
  Strategy,
  'admin-jwt-two-factor',
) {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.adminModel.findOne({ _id: payload.userId });

    if (!user?.isTwoFaEnabled) {
      /**
       * user object created on request when 2fa is enabled.
       */
      return user;
    }
    /**
     * user object created on request when 2fa is disabled.
     */
    if (user?.isTwoFaEnabled && payload?.is2FaAuthenticated) {
      return user;
    }
  }
}

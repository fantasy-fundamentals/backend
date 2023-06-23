import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config/config.service';
import {
  AdminDocument,
  AdminEntity,
} from 'src/database/entities/admin-email.entity';

@Injectable()
export class AdminStrategy extends PassportStrategy(
  Strategy,
  'admin-auth-guard',
) {
  constructor(
    config: ConfigService,
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: config.jwtSecret,
    });
  }

  // validate
  async validate(user: any): Promise<boolean> {
    const admin = await this.adminModel.find({ email: user.email });

    if (admin) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}

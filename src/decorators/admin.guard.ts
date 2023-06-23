import {
  BadRequestException,
  ExecutionContext,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from 'src/config/config.service';
import {
  AdminDocument,
  AdminEntity,
} from 'src/database/entities/admin-email.entity';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-auth-guard') {
  constructor(
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  // check auth token bearer
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = await context.switchToHttp().getRequest();
      const access_token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      const verify = await this.jwtService.verify(access_token, {
        secret: this.config.jwtSecret,
      });
      const decode: any = await this.jwtService.decode(access_token);
      if (verify && decode) {
        const admin = await this.adminModel.findOne({ email: decode.email });
        if (admin) {
          return true;
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new BadRequestException('Bad Request', 'Something went wrong');
      }
    } catch (e) {
      throw new BadRequestException(
        'JWT must be provided',
        'Internal Server Error',
      );
    }
  }
}

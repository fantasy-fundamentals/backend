import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdminDocument,
  AdminEntity,
} from 'src/database/entities/admin-email.entity';
import { AuthenticationDto } from './dto/authentication.dto';
import { ConfigService } from 'src/config/config.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}

  // admin login
  async adminLogin(body: AuthenticationDto): Promise<Object> {
    try {
      let token;
      const { email, password } = body;
      const admin = await this.adminModel.findOne({ email: email });
      const hash = admin.password;
      const isMatch = await bcrypt.compare(password, hash);
      if (!admin)
        throw new HttpException('No email found.', HttpStatus.NOT_FOUND);

      if (isMatch) {
        token = await this.generateJWT(email);
        return {
          message: `Login successfully...`,
          token: token,
        };
      } else {
        throw new BadRequestException(
          'Email or password is incorrect',
          'Internal Server Error',
        );
      }
    } catch (e) {
      throw new BadRequestException(
        'Email or password is incorrect',
        'Internal Server Error',
      );
    }
  }

  // add super admin
  async addSuperAdmin(admin: AuthenticationDto): Promise<string> {
    try {
      const { email, password } = admin;
      const saltOrRounds = this.config.saltOrRound;
      const hashPassword = await bcrypt.hash(password, saltOrRounds);
      const obj = {
        email: email,
        password: hashPassword,
      };

      const found = await this.adminModel.findOne({ email: email });
      const count = await this.adminModel.count();
      if (!found && count === 0) {
        await this.adminModel.create(obj);
        return 'Super Admin created';
      } else {
        throw new BadRequestException(
          'Email or password is incorrect',
          'Not possible more than one admin',
        );
      }
    } catch (e) {
      throw new BadRequestException(
        'Email or password is incorrect',
        'Not possible more than one admin',
      );
    }
  }

  // generate jwt
  async generateJWT(email: string): Promise<string> {
    try {
      let access_token;
      const payload = { email };
      access_token = await this.jwtService.sign(payload, {
        secret: this.config.jwtSecret,
      });
      return access_token;
    } catch (e) {
      throw new BadRequestException(
        'Email is incorrect',
        'Internal Server Error',
      );
    }
  }
}

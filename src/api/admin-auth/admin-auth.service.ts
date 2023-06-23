import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { adminJwtPayload } from 'src/api/auth/strategy/jwt-payload.interface';
import { AdminEntity, AdminDocument } from 'src/database/entities/admin.entity';
import { AdminAuthCredentialsDto } from './dto/admin-auth-credentials.dto';
import { AdminLoginCredentialsDto } from './dto/admin-login-credentials.dto';
import { UserEntity, UserDocument } from '../../database/entities/user.entity';
import { Role } from 'src/api/auth/enums/role.enum';
import { BlockSubAdminDto } from './dto/block-sub-admin.dto';
import { SOCKET_TYPES } from 'src/api/gateways/types/socketTypes';
import { GatewaysService } from 'src/api/gateways/gateways.service';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(AdminEntity.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    private readonly gatewayService: GatewaysService,
  ) {}

  async register(authCredentialsDto: AdminAuthCredentialsDto) {
    try {
      const { password } = authCredentialsDto;
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser: any = await this.adminModel.create({
        ...authCredentialsDto,
        password: hashedPassword,
      });

      createdUser.password = undefined;
      return createdUser;
    } catch (err) {
      if (err.message.indexOf('11000') != -1) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.FORBIDDEN,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserInfo(email: string) {
    const user: UserEntity = await this.userModel.findOne({ email }).lean();
    if (!user) throw new NotFoundException({ message: 'user not found' });
    return user;
  }

  async getJwtToken(user: any, is2FaAuthenticated = false) {
    const payload: adminJwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async login(
    loginAuthCredential: AdminLoginCredentialsDto,
  ): Promise<{ accessToken: string; isBlocked: boolean }> {
    const { email, password } = loginAuthCredential;
    const user = await this.adminModel.findOne({ email: email.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken: string = await this.getJwtToken(user);
      return { accessToken, isBlocked: user.isBlocked };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async changePassword(
    userId: string,
    newPassword: string,
    oldPassword: string,
  ) {
    try {
      const user = await this.adminModel.findById(userId);
      if (!user) throw new NotFoundException({ message: 'user not found' });

      const verified = bcrypt.compareSync(oldPassword, user.password);

      if (!verified)
        throw new ForbiddenException({ message: "Old Password didn't match" });

      const hashPassword = bcrypt.hashSync(newPassword, 8);

      const _user = await this.adminModel.findOneAndUpdate(
        { _id: userId },
        { password: hashPassword },
      );

      _user.password = undefined;

      return {
        message: 'Password changed successfully',
      };
    } catch (e) {
      throw e;
    }
  }

  async sdira(user) {
    try {
      const existingUser = await this.userModel.findById(user);

      /** update user */
      const _user = await this.userModel.findOneAndUpdate(
        { _id: user },
        { sdira: !existingUser.sdira },
      );

      return await this.userModel.findById(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getAllSubAdmins() {
    try {
      return await this.adminModel.find({ role: Role.SUB_ADMIN });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async blockSubAdminAccount(payload: BlockSubAdminDto) {
    const updatedUser = await this.adminModel.findOneAndUpdate(
      {
        _id: payload.userId,
      },
      {
        isBlocked: payload.isblocked,
        blockReason: payload.reasonToBlock,
      },
      { new: true },
    );
    //
    this.gatewayService.emit(
      {
        type: SOCKET_TYPES.USER_BLOCKED,
        user: updatedUser,
      },
      updatedUser.email,
    );

    return {
      message: 'Status updated successfully',
    };
  }

  async deleteSubAdmin(_id: string) {
    await this.adminModel.findOneAndDelete({ _id });

    return {
      message: 'Sub admin deleted successfully',
    };
  }
}

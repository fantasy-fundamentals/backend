import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import {
  PasswordResetEntity,
  PasswordResetDocument,
} from 'src/database/entities/passwordReset.entity';
import { EmailHandlerService } from 'src/api/email-handler/email-handler.service';
import { getVerificationTemplate } from 'src/api/email-handler/templates/emailVerification';
import { getWelcomeTemplate } from 'src/api/email-handler/templates/welcomeTemplate';
import { CONSTANTS } from 'src/utils/constants';
import { UserEntity, UserDocument } from '../../database/entities/user.entity';
import {
  WalletEntity,
  WalletDocument,
} from '../../database/entities/wallet.entity';
import { WalletService } from '../wallet/wallet.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { JwtPayload } from './strategy/jwt-payload.interface';
import { generateRandomString } from 'src/shared/helpers/generate-random-string.helper';

export type JwtDecodeResponse = string | { [key: string]: any };

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PasswordResetEntity.name)
    private readonly PasswordResetModel: Model<PasswordResetDocument>,
    private readonly emailService: EmailHandlerService,
    private readonly configService: ConfigService,
  ) {}

  async register(authCredentialsDto: AuthCredentialsDto) {
    try {
      const { password } = authCredentialsDto;
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser: any = await this.userModel.create({
        ...authCredentialsDto,
        affiliateCode: generateRandomString(8),
        password: hashedPassword,
      });

      /**
       * Creating wallets for the current user. This can be map to a function
       * which will run after the user email has been confirmed.
       */
      createdUser.password = undefined;
      const jwtToken = await this.getJwtToken(createdUser);

      const verificationTemplate = getVerificationTemplate(
        authCredentialsDto.name,
        `${process.env.SERVER_URL}/auth/verify-email/${jwtToken}`,
      );

      await this.emailService.sendGeneric(
        verificationTemplate,
        authCredentialsDto.email,
        'Email Verification',
      );

      return 'Verification Email Sent Successfully';
    } catch (err) {
      console.log(
        '🚀 ~ file: auth.service.ts ~ line 103 ~ AuthService ~ register ~ err',
        err,
      );

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

  async verifyEmail(token: { token: string }) {
    const finalToken = token.token;

    const user: any = await this.decodeJwtToken(finalToken);

    const existingUser = await this.userModel.findOne({
      _id: user.userId,
    });

    if (!existingUser) {
      throw new BadRequestException('User does not exist');
    }

    if (Boolean(existingUser.isEmailVerified)) {
      throw new BadRequestException('User email is already verified');
    }

    await this.userModel.findOneAndUpdate(
      { _id: user.userId },
      {
        isEmailVerified: true,
      },
    );

    const verificationTemplate = getWelcomeTemplate(user.name);

    await this.emailService.sendGeneric(
      verificationTemplate,
      user.email,
      'Welcome to Fantasy Funduhmentals',
    );

    return 'Email verified successfully';
  }

  getJwtToken(user: any, is2FaAuthenticated = false) {
    const payload: JwtPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is2FaEnabled: user.isTwoFaEnabled,
      is2FaAuthenticated,
    };
    return this.jwtService.sign(payload);
  }

  decodeJwtToken(token: string): JwtDecodeResponse {
    return this.jwtService.decode(token);
  }

  async login(loginAuthCredential: LoginCredentialsDto): Promise<{
    _id: string;
    accessToken: string;
    email: string;
    name: string;
  }> {
    const { email, password } = loginAuthCredential;
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    if (!user?.isEmailVerified) {
      const jwtToken = await this.getJwtToken(user);

      const verificationTemplate = getVerificationTemplate(
        user.name,
        `${process.env.SERVER_URL}/auth/verify-email/${jwtToken}`,
      );

      await this.emailService.sendGeneric(
        verificationTemplate,
        user.email,
        'Email Verification',
      );

      throw new BadRequestException(
        'Email address is not verified, verification link sent!',
      );
    }

    if (user?.isBlocked) {
      throw new BadRequestException(user.blockReason);
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken: string = await this.getJwtToken(user);

      if (loginAuthCredential.fcmToken) {
        this.updateUserAuthToken(user._id, loginAuthCredential.fcmToken);
      }

      return {
        _id: user._id.toString(),
        accessToken,
        name: user.name,
        email: user.email,
      };
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
      /** find user */
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException({ message: 'user not found' });

      /** match password */
      const verified = bcrypt.compareSync(oldPassword, user.password);

      if (!verified)
        throw new ForbiddenException({ message: "Old Password didn't match" });

      /** hash password and save it */
      const hashPassword = bcrypt.hashSync(newPassword, 8);

      /** update user */
      const _user = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { password: hashPassword },
      );

      _user.password = undefined;
      return {
        message: 'Password changed successfully',
      };

      //TODO blacklist the previous token
    } catch (e) {
      throw e;
    }
  }

  async forgotPassword(ForgotPasswordParams: ForgotPasswordDto) {
    try {
      const { email } = ForgotPasswordParams;
      await this.PasswordResetModel.deleteMany({
        email,
      });
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('User with the given email not found');
      }

      let code = Math.floor(1000 + Math.random() * 9000);
      console.log(
        '🚀 ~ file: auth.service.ts ~ line 179 ~ AuthService ~ forgotPassword ~ code',
        code,
      );

      const mail = {
        to: email,
        subject: 'Password Reset Email',
        from: this.configService.get('FROM_EMAIL'),
        text: `Your password reset code is ${code}. Please do not share this with anyone.`,
      };

      await this.PasswordResetModel.create({
        email,
        code,
      });

      await this.emailService.sendEmail(mail);

      return {
        message: 'Password reset email has been sent successfully!',
      };
    } catch (err) {
      console.log(
        '🚀 ~ file: auth.service.ts ~ line 198 ~ AuthService ~ forgotPassword ~ err',
        err,
      );
      throw err;
    }
  }

  async verifyPasswordResetPin(verifyPinParams: VerifyPinDto) {
    try {
      const { code, email } = verifyPinParams;
      const dbCode = await this.PasswordResetModel.findOne({ code, email });
      if (!dbCode) {
        throw new NotFoundException('Invalid Code');
      }
      const user = await this.userModel.findOne({ email: dbCode.email });
      const authToken = await this.getJwtToken(user);
      await this.PasswordResetModel.deleteOne({ _id: dbCode._id });
      return {
        message: 'Code validated',
        status: true,
        authToken,
      };
    } catch (err) {
      throw err;
    }
  }

  async createNewPassword(newPasswordParams: NewPasswordDto, user: UserEntity) {
    try {
      const { password } = newPasswordParams;
      const hashPassword = bcrypt.hashSync(password, 8);
      await this.userModel.findOneAndUpdate(
        { _id: user._id },
        { password: hashPassword },
      );
      return {
        message: 'Password has been changed successfully. Login to continue',
        status: true,
      };
    } catch (err) {
      throw err;
    }
  }

  async blockUser(userId) {
    try {
      await this.userModel.findOneAndUpdate({ _id: userId }, { block: true });
      return {
        message: 'Account status has been changed',
        status: true,
      };
    } catch (err) {
      throw err;
    }
  }

  async adminChangePassword(userId: string, newPassword: string) {
    try {
      /** find user */
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException({ message: 'user not found' });

      /** hash password and save it */
      const hashPassword = bcrypt.hashSync(newPassword, 8);

      /** update user */
      const _user = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { password: hashPassword },
      );

      _user.password = undefined;
      return _user;

      //TODO blacklist the previous token
    } catch (e) {
      throw e;
    }
  }

  async updateUserAuthToken(userId: string, fcmToken: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { fcmToken },
      { new: true },
    );
  }

  async updateUserNotificationSetting(
    userId: string,
    notificationsEnabled: boolean,
  ) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId },
      { notificationsEnabled },
      { new: true },
    );
  }
}

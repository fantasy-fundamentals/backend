import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtDecodeResponse, AuthService } from 'src/api/auth/auth.service';
import { UserService } from 'src/api/user/user.service';

export interface PublicOrAuthenticatedRequest extends Request {
  isGuestUser: boolean;
  user: JwtDecodeResponse;
}

@Injectable()
export class DetectGuestOrAutheticatedUserMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  async use(req: PublicOrAuthenticatedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    req.isGuestUser = true;
    req.user = null;

    if (header) {
      const token = header.split(' ')[1];
      const decoded = this.authService.decodeJwtToken(token);
      if (Boolean(decoded)) {
        const userId: string = (decoded as { [key: string]: any }).userId;
        const eitherUserOrNull = await this.userService.findById(userId);
        if (eitherUserOrNull !== null) {
          req.isGuestUser = false;
          req.user = decoded;
        }
      }
    }

    next();
  }
}
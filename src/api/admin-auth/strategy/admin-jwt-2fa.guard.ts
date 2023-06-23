import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwt2FaAuthGuard extends AuthGuard('admin-jwt-two-factor') {}

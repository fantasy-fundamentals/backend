import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Jwt2FaAuthGuard extends AuthGuard('jwt-two-factor') {}

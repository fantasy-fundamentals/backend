import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { AuthenticationDto } from './dto/authentication.dto';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @ApiOperation({ summary: 'Admin Login' })
  @Post('/login')
  async adminLogin(@Body() admin: AuthenticationDto): Promise<Object> {
    return await this.authService.adminLogin(admin);
  }

  // @ApiOperation({ summary: 'Admin account create' })
  // @Post('/addSuperAdmin')
  // async addSuperAdmin(@Body() admin: AuthenticationDto): Promise<Object> {
  //   return await this.authService.addSuperAdmin(admin);
  // }
}

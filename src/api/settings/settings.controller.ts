import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @ApiOperation({ summary: 'Maintenance Mode' })
  @ApiParam({ name: 'status' })
  @Get('maintenance-mode/:status')
  async maintenance(@Param() { status }) {
    return await this.settings.maintenance(status);
  }

  @ApiOperation({ summary: 'Update Settings' })
  @Post('/')
  async update(@Body() req: SettingsDto) {
    return await this.settings.update(req);
  }

  @ApiOperation({ summary: 'Get Settings' })
  @Get('/')
  async get() {
    return await this.settings.get();
  }

  @ApiOperation({ summary: 'Get environment' })
  @Get('/environment')
  async environment() {
    return await this.settings.environment();
  }

  @ApiOperation({ summary: 'Get tweets' })
  @ApiParam({ name: 'username' })
  @Get('/tweets/:username')
  async getTweets(@Param() { username }) {
    return await this.settings.getTweets(username);
  }

  @ApiOperation({ summary: 'Get coin rate' })
  @ApiParam({ name: 'coinSymbol' })
  @Get('/rate/:coinSymbol')
  async coinRate(@Param() { coinSymbol }) {
    return await this.settings.coinRate(coinSymbol);
  }

  //@ApiOperation({ summary: 'testing' })
  @Get(
    'asahsasiasiejsasansansastestuolivurgrgrggdfrefrgsrggrsgddf7ikykviuyvgkiukftmg',
  )
  async testSettings() {
    return await this.settings.testSettings();
  }
}

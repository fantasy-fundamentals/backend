import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';
import { ValidateMongoId } from 'src/shared/pipes/mongo-objectid-validator.pipe';
import { UseGuards } from '@nestjs/common/decorators';
import { AdminJwt2FaAuthGuard } from '../admin-auth/strategy/admin-jwt-2fa.guard';

@ApiTags('Shop management')
@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) { }

  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Add a new product' })
  @Post('/')
  async create(@Body() body: CreateShopDto) {
    return await this.shopService.create(body);
  }

  @ApiOperation({ summary: 'Get all active products' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @Get('/')
  async get(@Query() query) {
    return await this.shopService.get(query);
  }

  @ApiOperation({ summary: 'Find product By Id' })
  @Get('/:productId')
  async findById(@Param('productId', ValidateMongoId) productId: string) {
    return await this.shopService.getSingleProductDetail(productId);
  }

  @ApiOperation({ summary: 'Get all active products' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @Get('/admin')
  async getAllAdmin(@Query() query) {
    return await this.shopService.getAllAdmin(query);
  }

  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Update' })
  @Put('/')
  async update(@Body() payload: UpdateShopDto) {
    return await this.shopService.update(payload);
  }

  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Delete' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.shopService.delete(id);
  }

  @UseGuards(AdminJwt2FaAuthGuard)
  @ApiOperation({ summary: 'Change status of product' })
  @ApiParam({ name: 'id' })
  @Get('/status/:id')
  async status(@Param('id') id): Promise<object> {
    return this.shopService.status(id);
  }
}

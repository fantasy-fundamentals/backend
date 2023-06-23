import { BadRequestException, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopDocument, ShopEntity } from 'src/database/entities/shop.entity';
import { UpdateShopDto } from './dto/shop.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(ShopEntity.name)
    private readonly shopModel: Model<ShopDocument>,
  ) { }

  async create(payload): Promise<object> {
    try {
      await this.shopModel.create(payload);
      return {
        status: 201,
        message: 'Product created successfully!',
      };
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getSingleProductDetail(productId: string) {
    const eitherProductOrNull = await this.findById(productId);

    if (eitherProductOrNull === null) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return {
      data: eitherProductOrNull
    }
  }

  async findById(_id: string): Promise<ShopDocument | null> {
    return await this.shopModel.findOne({ _id });
  }

  async reduceStockCountByOneForVariant(productId: string, size: string) {
    const productFound = await this.shopModel.findOne({ _id: productId });

    productFound.availableVariants = productFound.availableVariants.map((variant) => {
      if (variant.size === size) {
        return {
          ...variant,
          stock: variant.stock - 1
        }
      } else {
        return variant;
      }
    })

    return await productFound.save();
  }

  async reduceStockCountByOne(productId: string) {
    const productFound = await this.shopModel.findOne({ _id: productId });
    productFound.stock = productFound.stock - 1;
    return await productFound.save();
  }

  async get({ page, limit }): Promise<{ data: ShopDocument[]; total: number }> {
    try {
      return {
        data: await this.shopModel
          .find()
          .skip(+page * +limit)
          .limit(+limit),
        total: await this.shopModel.countDocuments(),
      };
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllAdmin({ page, limit }): Promise<ShopDocument[]> {
    try {
      return await this.shopModel
        .find()
        .skip(+page * +limit)
        .limit(+limit);
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async update(payload: UpdateShopDto): Promise<Object> {
    try {
      const { id, ...payloadWithoutId } = payload;
      await this.shopModel.findByIdAndUpdate(payload.id, {
        ...payloadWithoutId,
      });
      return {
        status: 201,
        message: 'Product updated successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async getAllShopsCount(): Promise<number> {
    return await this.shopModel.countDocuments();
  }

  async delete(_id): Promise<Object> {
    try {
      const found = await this.shopModel.findById({ _id });
      if (!found) {
        throw new BadRequestException('Product not found');
      }
      await this.shopModel.findByIdAndDelete(_id);
      return {
        status: 201,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }

  async status(id): Promise<object> {
    try {
      const product = await this.shopModel.findById(id);

      if (product) {
        return await this.shopModel.findByIdAndUpdate(
          id,
          {
            isActive: !product.isActive,
          },
          { upsert: true },
        );
      }

      return {
        message: 'Product status updated successfully!',
      };
    } catch (error) {
      throw new BadRequestException('Internal Server Error');
    }
  }
}

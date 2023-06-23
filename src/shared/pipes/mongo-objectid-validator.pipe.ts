import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectId } from 'mongodb'

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
  transform(value: string, _metadata: ArgumentMetadata): string {
    if (ObjectId.isValid(value)) {
      if (String(new ObjectId(value)) === value) return value;
      throw new BadRequestException('The provided _id is not valid')
    }
    throw new BadRequestException('The provided _id is not valid')
  };
}
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    console.log(
      '🚀 ~ file: validation-error.filter.ts ~ line 13 ~ MongoExceptionFilter ~ exception',
      exception,
    );
    switch (exception.code) {
      case 11000:
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        response.statusCode = HttpStatus.FORBIDDEN;
        response.json({
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
          message: 'Coin already listed!',
        });
    }
  }
}

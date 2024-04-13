import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { hanaError } from './hanaError';
import { Response } from 'express';

@Catch(hanaError)
export class HanaErrorFilter implements ExceptionFilter {
  catch(exception: hanaError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      code: exception.getResponse()['code'],
      message: exception.getResponse()['message'],
    });
  }
}

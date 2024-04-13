// src/error/error.filter.ts
// 处理全局异常的过滤器

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const data = exception.getResponse();
      const { message } = exception;

      response.status(statusCode).json({
        code: data?.['code'] || statusCode,
        message: data?.['message'] || message || 'Unknown Error',
      });
    } else if (exception instanceof QueryFailedError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: exception.message || 'Database Error',
      });
    } else {
      response
        .status(
          exception?.['statusCode'] ||
            exception?.['status'] ||
            HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
    }
  }
}

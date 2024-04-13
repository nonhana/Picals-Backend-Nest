// src/error/error.filter.ts
// 用于处理一般异常的过滤器（由Nest主动抛出）

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      code: status,
      message: exception.message,
      data: {
        error: exception.getResponse(),
        path: request.url,
      },
    });
  }
}

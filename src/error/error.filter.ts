// src/error/error.filter.ts
// 处理全局异常的过滤器

import { Catch, HttpStatus, HttpException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

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
					exception?.['statusCode'] || exception?.['status'] || HttpStatus.INTERNAL_SERVER_ERROR,
				)
				.json({
					code: HttpStatus.INTERNAL_SERVER_ERROR,
					message: exception.message || 'Internal Server Error',
				});
		}
	}
}

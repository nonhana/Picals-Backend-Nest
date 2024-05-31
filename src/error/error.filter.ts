// src/error/error.filter.ts
// 处理全局异常的过滤器

import { Catch, HttpStatus, HttpException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Response } from 'express';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost): any {
		const response = host.switchToHttp().getResponse<Response>();

		if (exception instanceof HttpException) {
			const statusCode = exception.getStatus();
			const data = exception.getResponse();
			const { message } = exception;
			const errorInfo = {
				code: data?.['code'] || statusCode,
				message: data?.['message'] || message || 'Unknown Error',
			};
			if (statusCode === HttpStatus.PAYLOAD_TOO_LARGE) {
				errorInfo['message'] = '上传文件过大，跟根据上传的具体要求说明重新上传';
			}
			response.status(statusCode).json(errorInfo);
		} else if (exception instanceof QueryFailedError) {
			response.status(HttpStatus.BAD_REQUEST).json({
				code: HttpStatus.BAD_REQUEST,
				message: exception.message || 'Database Error',
			});
		} else if (exception instanceof MulterError) {
			response.status(HttpStatus.BAD_REQUEST).json({
				code: HttpStatus.BAD_REQUEST,
				message: exception.message || 'File Upload Error',
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

// src/interceptors/invoke-record.interceptor.ts
// 定义用于记录请求信息的拦截器

import {
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
	Injectable,
	Logger,
} from '@nestjs/common';
import { tap, type Observable } from 'rxjs';
import type { AuthenticatedRequest, Response } from 'express';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
	// Logger 是 NestJS 提供的日志工具，提供了一系列的方法用于记录日志
	private readonly logger = new Logger(InvokeRecordInterceptor.name);

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const response = context.switchToHttp().getResponse<Response>();

		const userAgent = request.headers['user-agent'];

		const { ip, method, path } = request;

		this.logger.debug(
			`${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} ${
				context.getHandler().name
			} invoked...`,
		);

		this.logger.debug(`user: ${request.user?.id}, ${request.user?.username}`);

		const now = Date.now();

		return next.handle().pipe(
			tap((res) => {
				this.logger.debug(
					`${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
				);
				this.logger.debug(`Response: ${JSON.stringify(res)}`);
			}),
		);
	}
}

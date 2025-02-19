// src/interceptor/response.interceptor.ts
// 定义用于约束返回类型的响应拦截器

import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Data<T> {
	data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
	intercept(_: ExecutionContext, next: CallHandler): Observable<Data<T>> {
		return next.handle().pipe(
			map((data) => ({
				code: 200,
				message: 'success',
				data,
			})),
		);
	}
}

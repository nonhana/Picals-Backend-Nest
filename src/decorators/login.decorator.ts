import type { ExecutionContext } from '@nestjs/common';
import { SetMetadata, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest } from 'express';

// RequireLogin 装饰器，用于指定哪个接口需要登录
export const RequireLogin = () => SetMetadata('require-login', true);

// Visitor 装饰器，用于指定哪个接口可以不需要登录就可以访问。并且如果有登录，会照常解析用户信息
export const Visitor = () => SetMetadata('visitor', true);

// UserInfo 装饰器，用于从请求中获取用户信息（jwt解析）
export const UserInfo = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
	if (!request.user) return null;
	return data ? request.user[data] : request.user;
});

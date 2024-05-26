import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from 'express';

export interface JwtUserData {
	id: string;
	email: string;
	username: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
	@Inject()
	private readonly reflector: Reflector;

	@Inject(JwtService)
	private readonly jwtService: JwtService;

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

		const authorization = request.headers.authorization || '';

		const bearer = authorization.split(' ');

		const token = bearer[1];

		const visitor = this.reflector.getAllAndOverride('visitor', [
			context.getClass(),
			context.getHandler(),
		]);

		if (visitor) {
			try {
				if (token) {
					const info = this.jwtService.verify(token);
					request.user = info;
				}
				return true;
			} catch (error) {
				throw new UnauthorizedException('Token expired, please log in again');
			}
		}

		const requireLogin = this.reflector.getAllAndOverride('require-login', [
			context.getClass(),
			context.getHandler(),
		]);

		if (!requireLogin) {
			return true;
		}

		try {
			const info = this.jwtService.verify(token);
			request.user = info;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Token expired, please log in again');
		}
	}
}

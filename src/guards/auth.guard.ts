import { Injectable, Inject } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Observable } from 'rxjs';
import { hanaError } from 'src/error/hanaError';
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

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization || '';
    const bearer = authorization.split(' ');
    if (!bearer || bearer.length < 2) {
      throw new hanaError(10106);
    }
    const token = bearer[1];
    try {
      const info = this.jwtService.verify(token);
      request.user = info;
      return true;
    } catch (error) {
      throw new hanaError(10107);
    }
  }
}

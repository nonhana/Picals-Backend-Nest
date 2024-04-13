import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TOKEN_WHITE_LIST } from 'src/utils/constants';
import { hanaError } from 'src/error/hanaError';
import { errorMessages } from 'src/error/errorList';

@Injectable()
export class AuthGuard implements CanActivate {
  // 注入JwtService服务，用于对token进行验证
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const path = request.path;
    if (TOKEN_WHITE_LIST.includes(path)) {
      return true;
    }
    const authorization = request.headers.authorization || '';
    const bearer = authorization.split(' ');
    if (!bearer || bearer.length < 2) {
      throw new hanaError(10106, errorMessages.get(10106));
    }
    const token = bearer[1];
    try {
      const info = this.jwtService.verify(token);
      (request as any).user = info;
      return true;
    } catch (error) {
      throw new hanaError(10107, errorMessages.get(10107));
    }
  }
}

import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorFilter } from './error/error.filter';
import { HanaErrorFilter } from './error/hana-error.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './apps/user/user.module';
import { User } from './apps/user/entities/user.entity';
import { IllustratorModule } from './apps/illustrator/illustrator.module';
import { Illustrator } from './apps/illustrator/entities/illustrator.entity';
import { IllustrationModule } from './apps/illustration/illustration.module';
import { Illustration } from './apps/illustration/entities/illustration.entity';
import { LabelModule } from './apps/label/label.module';
import { Label } from './apps/label/entities/label.entity';
import { CommentModule } from './apps/comment/comment.module';
import { HistoryModule } from './apps/history/history.module';
import { SearchHistoryModule } from './apps/search-history/search-history.module';
import { History } from './apps/history/entities/history.entity';
import { SearchHistory } from './apps/search-history/entities/search-history.entity';
import { Comment } from './apps/comment/entities/comment.entity';
import { AuthGuard } from './guards/auth.guard';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOST'),
          port: configService.get('MYSQL_PORT'),
          username: configService.get('MYSQL_USER'),
          password: configService.get('MYSQL_PASS'),
          database: configService.get('MYSQL_DB'),
          synchronize: true,
          logging: false,
          entities: [
            User,
            Illustrator,
            Illustration,
            Label,
            Comment,
            History,
            SearchHistory,
          ],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    IllustratorModule,
    IllustrationModule,
    LabelModule,
    CommentModule,
    HistoryModule,
    SearchHistoryModule,
    RedisModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    // 全局错误过滤器（一般异常，由框架主动抛出）
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    // 全局错误过滤器（自定义异常，由用户主动抛出）
    {
      provide: APP_FILTER,
      useClass: HanaErrorFilter,
    },
    // 全局拦截器，统一返回格式
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 全局管道，验证数据
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // 全局守卫
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

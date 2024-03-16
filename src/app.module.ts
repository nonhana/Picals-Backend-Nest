import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { IllustratorModule } from './illustrator/illustrator.module';
import { Illustrator } from './illustrator/entities/illustrator.entity';
import { IllustrationModule } from './illustration/illustration.module';
import { Illustration } from './illustration/entities/illustration.entity';
import { LabelModule } from './label/label.module';
import { Label } from './label/entities/label.entity';
import { CommentModule } from './comment/comment.module';
import { HistoryModule } from './history/history.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { History } from './history/entities/history.entity';
import { SearchHistory } from './search-history/entities/search-history.entity';
import { Comment } from './comment/entities/comment.entity';

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
          logging: true,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局错误过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局拦截器，统一返回格式
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorFilter } from './common/error/error.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UserModule } from './modules/user/user.module';
import { IllustratorModule } from './modules/illustrator/illustrator.module';
import { IllustrationModule } from './modules/illustration/illustration.module';
import { LabelModule } from './modules/label/label.module';
import { CommentModule } from './modules/comment/comment.module';
import { HistoryModule } from './modules/history/history.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { AuthGuard } from './common/guards/auth.guard';
import { InvokeRecordInterceptor } from './common/interceptors/invoke-record.interceptor';
import { R2Module } from './infra/r2/r2.module';
import { ImgHandlerModule } from './services/img-handler/img-handler.module';
import { DatabaseModule } from './infra/database/database.module';
import { JwtModule } from './infra/jwt/jwt.module';
import { CacheModule } from './infra/cache/cache.module';
import { ConfigModule } from './infra/config/config.module';
import { EmailModule } from './infra/email/email.module';

@Module({
	imports: [
		// 基础设施
		ConfigModule,
		DatabaseModule,
		JwtModule,
		CacheModule,
		R2Module,
		EmailModule,

		// 数据库实体
		UserModule,
		IllustratorModule,
		IllustrationModule,
		LabelModule,
		CommentModule,
		HistoryModule,
		FavoriteModule,

		// 自定义服务
		ImgHandlerModule,
	],
	providers: [
		// 全局错误过滤器
		{
			provide: APP_FILTER,
			useClass: ErrorFilter,
		},
		// 全局拦截器，统一返回格式
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		// 全局拦截器，用于记录日志
		{
			provide: APP_INTERCEPTOR,
			useClass: InvokeRecordInterceptor,
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

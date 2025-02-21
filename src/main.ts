import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	const configConfig = app.get(ConfigService);
	app.enableCors({
		origin: configConfig.get('CORS_ORIGIN'),
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});

	await app.listen(configConfig.get('NEST_PORT'));
}
bootstrap();

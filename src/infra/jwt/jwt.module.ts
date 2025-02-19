import { Global, Module } from '@nestjs/common';
import { JwtModule as jwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
	imports: [
		jwtModule.registerAsync({
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
	],
})
export class JwtModule {}

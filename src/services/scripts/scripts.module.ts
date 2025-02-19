import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { Illustrator } from '@/modules/illustrator/entities/illustrator.entity';
import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { Image } from '@/modules/illustration/entities/image.entity';
import { UserModule } from '@/modules/user/user.module';
import { LabelModule } from '@/modules/label/label.module';
import { IllustratorModule } from '@/modules/illustrator/illustrator.module';
import { IllustrationModule } from '@/modules/illustration/illustration.module';
import { R2Module } from '@/infra/r2/r2.module';
import { ConfigModule } from '@/infra/config/config.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { CacheModule } from '@/infra/cache/cache.module';
import { JwtModule } from '@/infra/jwt/jwt.module';

@Module({
	imports: [
		ConfigModule,
		DatabaseModule,
		CacheModule,
		JwtModule,
		R2Module,
		UserModule,
		LabelModule,
		IllustratorModule,
		IllustrationModule,
		TypeOrmModule.forFeature([Illustration, Illustrator, User, Image]),
	],
	providers: [ScriptsService],
})
export class ScriptsModule {}

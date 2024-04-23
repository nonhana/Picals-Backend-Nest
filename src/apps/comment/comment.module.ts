import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustration } from '../illustration/entities/illustration.entity';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Comment, Illustration, User])],
	controllers: [CommentController],
	providers: [CommentService],
})
export class CommentModule {}

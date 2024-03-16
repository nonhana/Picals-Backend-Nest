import { PartialType } from '@nestjs/mapped-types';
import { CreateIllustrationDto } from './create-illustration.dto';

export class UpdateIllustrationDto extends PartialType(CreateIllustrationDto) {}

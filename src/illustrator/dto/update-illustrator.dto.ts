import { PartialType } from '@nestjs/mapped-types';
import { CreateIllustratorDto } from './create-illustrator.dto';

export class UpdateIllustratorDto extends PartialType(CreateIllustratorDto) {}

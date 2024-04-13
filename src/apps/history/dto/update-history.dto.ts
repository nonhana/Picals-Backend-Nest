import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoryDto } from './create-history.dto';

export class UpdateHistoryDto extends PartialType(CreateHistoryDto) {}

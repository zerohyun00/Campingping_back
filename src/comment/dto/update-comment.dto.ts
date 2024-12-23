import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentsDto } from './create-comment.dto';

export class UpdateCommentsDto extends PartialType(CreateCommentsDto) {}

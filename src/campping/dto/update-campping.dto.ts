import { PartialType } from '@nestjs/mapped-types';
import { CreateCamppingDto } from './create-campping.dto';

export class UpdateCamppingDto extends PartialType(CreateCamppingDto) {}

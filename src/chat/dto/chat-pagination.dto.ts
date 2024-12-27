import { IsInt, IsOptional } from 'class-validator';

export class ChatPaginationDto {
  @IsInt()
  @IsOptional()
  page: number = 1;

  @IsInt()
  @IsOptional()
  limit: number = 5;
}

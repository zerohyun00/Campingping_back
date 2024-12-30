import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class CreateCommentsDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '같이 놀러갈 사람~!',
  })
  @IsString({ message: stringValidationMessage })
  content: string;
}

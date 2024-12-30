import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';  // Swagger 데코레이터 추가
import { booleanValidationMessage } from 'src/common/validation-message/boolean-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class CreateFavoriteDto {
  @ApiProperty({
    description: '캠핑장 contentId',
    example: '10000',  // 예시 데이터 추가
  })
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  contentId: string;

  @ApiProperty({
    description: '즐겨찾기의 상태 (true: 즐겨찾기, false: 즐겨찾기 취소)',
    example: true,
  })
  @IsBoolean({ message: booleanValidationMessage })
  status: boolean;
}
import { IsNotEmpty, IsString, IsNumber} from 'class-validator';
import { Type } from 'class-transformer';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { ApiProperty } from '@nestjs/swagger';  // Swagger 데코레이터 추가
import { numberValidationMessage } from 'src/common/validation-message/number-validation.message';


export class CreateCommunityDto {
  @ApiProperty({
    description: '커뮤니티 제목',
    example: '캠핑 커뮤니티',
  })
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  title: string;

  @ApiProperty({
    description: '커뮤니티 내용',
    example: '캠핑 장소와 관련된 모든 정보를 공유하세요!',
  })
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: emptyValidationMessage })
  content: string;

  @ApiProperty({
    description: '커뮤니티 위치',
    example: '서울',
  })
  @IsString({ message: stringValidationMessage })
  location: string;

  @ApiProperty({
    description: '참여 가능한 인원 수',
    example: 20,
  })
  @IsNumber({}, { message: numberValidationMessage })
  people: number;

  @ApiProperty({
    description: '커뮤니티 시작 날짜',
    example: '2024-01-01T10:00:00Z',
  })
  @IsNotEmpty({ message: emptyValidationMessage })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: '커뮤니티 종료 날짜',
    example: '2024-01-03T10:00:00Z',
  })
  @IsNotEmpty({ message: emptyValidationMessage })
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: '경도 (longitude)',
    example: 126.9780,
  })
  @IsNumber()
  lon: number;

  @ApiProperty({
    description: '위도 (latitude)',
    example: 37.5665,
  })
  @IsNumber()
  lat: number;
}
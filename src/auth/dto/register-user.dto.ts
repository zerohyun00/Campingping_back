import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { emptyValidationMessage } from 'src/common/validation-message/empty-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class RegisterUserDto {
  @ApiProperty({
    example: 'example@example.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '사용자의 비밀번호. 최소 6자 이상.',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: emptyValidationMessage })
  @IsString({ message: stringValidationMessage })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({
    example: 'usernickname',
    description: '사용자의 닉네임',
    required: true,
  })
  @IsNotEmpty({ message: emptyValidationMessage })
  @IsString({ message: stringValidationMessage })
  nickname: string;
}
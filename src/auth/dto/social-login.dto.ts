import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { LoginType } from 'src/user/entities/user.entity';

export class SocialLoginDto {
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  nickname: string;

  @IsEnum(LoginType)
  type: LoginType;

  @IsOptional()
  @IsString()
  kakaoAccessToken?: string;

  @IsOptional()
  @IsString()
  kakaoRefreshToken?: string;

  @IsOptional()
  @IsString()
  googleAccessToken?: string;

  @IsOptional()
  @IsString()
  googleRefreshToken?: string;

  @IsOptional()
  @IsString()
  naverAccessToken?: string;

  @IsOptional()
  @IsString()
  naverRefreshToken?: string;
}

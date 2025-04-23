import { IsEmail, IsString } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { LoginType } from 'src/user/entities/user.entity';

export class SocialLoginDto {
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @IsString({ message: stringValidationMessage })
  nickname: string;

  type: LoginType.KAKAO;

  kakaoAccessToken: string;

  kakaoRefreshToken: string;
}

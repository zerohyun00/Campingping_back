import { IsEmail, IsString } from 'class-validator';
import { LoginType } from 'src/user/entities/user.entity';

export class SocialLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  nickname: string;

  type: LoginType.KAKAO;
}

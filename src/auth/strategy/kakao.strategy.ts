import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable() // 이 데코레이터를 추가해 NestJS 의존성 주입 활성화
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const nickname = profile.displayName;
    const kakaoId = profile.id;
    
    const generatedEmail = `${kakaoId}@kakao.com`;

    return {
      email: generatedEmail,
      nickname,
      type: 'KAKAO',
    };
  }
}

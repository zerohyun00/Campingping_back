import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable() // 이 데코레이터를 반드시 추가
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile._json.kakao_account?.email;
    const nickname = profile.displayName;
    const kakaoId = profile.id;

    const generatedEmail = email || `${kakaoId}@kakao.com`;

    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log('Profile:', JSON.stringify(profile, null, 2));
    console.log('Generated Email:', generatedEmail);

    return {
      email: generatedEmail,
      nickname,
      kakaoId,
      type: 'KAKAO',
    };
  }
}
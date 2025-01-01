import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // 카카오 계정의 이메일 정보와 닉네임 가져오기
    const email = profile._json.kakao_account?.email;
    const nickname = profile.displayName;
    const kakaoId = profile.id;

    // 이메일이 없는 경우, kakaoId를 사용하여 임시 이메일 생성
    const generatedEmail = email || `${kakaoId}@kakao.com`;

    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log('Profile:', JSON.stringify(profile, null, 2));
    console.log('Generated Email:', generatedEmail);

    return {
      email: generatedEmail,
      nickname,
      kakaoId, // 고유한 Kakao ID 추가
      type: 'KAKAO', // 로그인 유형 추가
    };
  }
}

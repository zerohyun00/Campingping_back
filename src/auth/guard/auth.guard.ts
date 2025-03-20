import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  handleRequest(err, user, info, context) {
    const res = context.switchToHttp().getResponse();
    if (err || !user) {
      res.redirect('/error?message=Unauthorized'); // 실패 시 리다이렉션
      return null; // 이후 컨트롤러 실행 방지
    }

    return user; // 인증 성공 시 사용자 정보 반환
  }
}
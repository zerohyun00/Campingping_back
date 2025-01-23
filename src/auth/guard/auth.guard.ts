import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
handleRequest(err, user, info, context) {
    if (err || !user) {
        throw err || new UnauthorizedException('로그인 실패');
    }
    return user; // 리다이렉션 대신 사용자 정보 반환
    }
}

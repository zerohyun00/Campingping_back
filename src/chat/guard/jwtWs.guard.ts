import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie'; // 쿠키 파싱 모듈

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('[DEBUG] JwtWsAuthGuard 실행');

    const client = context.switchToWs().getClient();
    const rawCookies = client.handshake.headers.cookie;

    console.log('[DEBUG] Raw Cookies:', rawCookies);

    if (!rawCookies) {
      console.error('[ERROR] 쿠키가 없습니다.');
      return false;
    }

    const parsedCookies = cookie.parse(rawCookies);
    const token = parsedCookies['accessToken'];

    if (!token) {
      console.error('[ERROR] accessToken이 없습니다.');
      return false;
    }

    try {
      const user = this.jwtService.verify(token);
      console.log('[DEBUG] Verified User:', user);
      client.data.user = user;
      return true;
    } catch (error) {
      console.error('[ERROR] JWT 검증 오류:', error.message);
      return false;
    }
  }
}

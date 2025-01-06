import { ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

export interface AuthenticatedRequest extends Request {
  user?: { sub: string };
  cookies: { [key: string]: string };
}
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>(); // 타입 지정
    const token = request.cookies['accessToken']; // 쿠키에서 토큰 가져오기
   
    if(!token){
      return false;
    }

    try {
      const user = this.jwtService.verify(token); // 토큰 검증
      request.user = user; // 인증된 사용자 정보 설정
      return true;
    } catch (error) {
      console.error('JWT 검증 오류: ', error.message); // 오류 로그 추가
      return false;
    }
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Prometheus와 Grafana 엔드포인트는 인터셉터를 거치지 않도록 설정
    if (request.url.includes('/api/metrics') || request.url.includes('/api/grafana')) {
      return next.handle(); // 인터셉터를 적용하지 않고 바로 처리
    }

    // 다른 엔드포인트는 정상적으로 인터셉터가 적용됨
    return next.handle().pipe(
      tap((data) => {
        // 응답 변형 처리 (예: JSON 응답 형식 변경 등)
      }),
    );
  }
}
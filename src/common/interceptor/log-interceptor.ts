import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const now = new Date(); // 시작 시간 기록
    const req = context.switchToHttp().getRequest<Request>();
    const path = req.url;
    const method = req.method;

    // 요청 로그
    console.log(`[REQ] ${method} ${path} ${now.toLocaleString('kr')}`);

    return next.handle().pipe(
      tap(() => {
        // 응답 시간 계산 후 로그 출력
        const elapsedTime = new Date().getTime() - now.getTime();
        console.log(
          `[RES] ${method} ${path} ${new Date().toLocaleString('kr')} - ${elapsedTime}ms`,
        );
      }),
      catchError((err) => {
        // 오류 발생 시 시간 계산 후 로그 출력
        const elapsedTime = new Date().getTime() - now.getTime();
        console.error(
          `[ERROR] ${method} ${path} ${new Date().toLocaleString('kr')} - ${elapsedTime}ms - ${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}

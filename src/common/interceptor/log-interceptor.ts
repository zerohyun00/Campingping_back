import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const now = new Date();
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    const method = req.method;

    console.log(`[REQ] ${method} ${path} ${now.toLocaleString('kr')}`);

    return next.handle().pipe(
      tap(() => {
        const elapsedTime = new Date().getTime() - now.getTime();
        console.log(
          `[RES] ${method} ${path} ${now.toLocaleString('kr')} - ${elapsedTime}ms`,
        );
      }),
      catchError((err) => {
        const elapsedTime = new Date().getTime() - now.getTime();
        console.error(
          `[ERROR] ${method} ${path} ${now.toLocaleString(
            'kr',
          )} - ${elapsedTime}ms - ${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}

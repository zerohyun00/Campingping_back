import { CallHandler, ExecutionContext, Injectable, NestInterceptor, OnModuleInit } from '@nestjs/common';
import { MetricsService } from '../metrics.service';
import { catchError, Observable, tap } from 'rxjs';
import { throwError } from 'rxjs';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor, OnModuleInit {
  private readonly requestSuccessHistogram: Histogram;
  private readonly requestFailHistogram: Histogram;
  private readonly failureCounter;

  constructor(private readonly metricsService: MetricsService) {
    this.requestSuccessHistogram = new Histogram({
      name: 'nestjs_success_requests',
      help: 'NestJs success requests - duration in seconds',
      labelNames: ['handler', 'controller', 'method'],
      buckets: [
        0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
      ],
    });

    this.requestFailHistogram = new Histogram({
      name: 'nestjs_fail_requests',
      help: 'NestJs fail requests - duration in seconds',
      labelNames: ['handler', 'controller', 'method'],
      buckets: [
        0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
      ],
    });

    this.failureCounter = new Counter({
      name: 'nestjs_requests_failed_count',
      help: 'NestJs requests that failed',
      labelNames: ['handler', 'controller', 'error', 'method'],
    });
  }

  onModuleInit() {
    console.log('Initializing metrics...');
    this.requestSuccessHistogram.reset();
    this.requestFailHistogram.reset();
    this.failureCounter.reset();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
        this.requestSuccessHistogram.observe({
          controller: context.getClass().name,
          handler: context.getHandler().name,
          method,
        }, elapsedTime / 1000); // 엘apsedTime을 초 단위로 변환하여 히스토그램에 기록
      }),
      catchError((err) => {
        // 오류 발생 시 시간 계산 후 로그 출력
        const elapsedTime = new Date().getTime() - now.getTime();
        console.error(
          `[ERROR] ${method} ${path} ${new Date().toLocaleString('kr')} - ${elapsedTime}ms - ${err.message}`,
        );
        this.requestFailHistogram.observe({
          controller: context.getClass().name,
          handler: context.getHandler().name,
          method,
        }, elapsedTime / 1000); // 실패 요청에 대한 히스토그램 기록
        this.failureCounter.inc({
          controller: context.getClass().name,
          handler: context.getHandler().name,
          error: err.message,
          method,
        });
        return throwError(() => err);
      }),
    );
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private requestSuccessHistogram: Histogram<string>;
  private requestFailHistogram: Histogram<string>;
  private failureCounter: Counter<string>;

  // 모듈 올라갈 때 초기화
  async onModuleInit() {
    console.log('Initializing metrics...');
    await this.initializeMetrics(); // Initialize metrics
  }

  // initializeMetrics 메서드를 public으로 변경
  public async initializeMetrics() {
    console.log('Initializing metrics...');
    
    // success_requests 메트릭 확인
    if (!register.getSingleMetric('nestjs_success_requests')) {
      this.requestSuccessHistogram = new Histogram({
        name: 'nestjs_success_requests',
        help: 'NestJs success requests - duration in seconds',
        labelNames: ['handler', 'controller', 'method'],
        buckets: [
          0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1,
          2.5, 5, 10,
        ],
      });
      register.registerMetric(this.requestSuccessHistogram);
    } else {
      this.requestSuccessHistogram = register.getSingleMetric('nestjs_success_requests') as Histogram<string>;
    }

    // fail_requests 메트릭 확인
    if (!register.getSingleMetric('nestjs_fail_requests')) {
      this.requestFailHistogram = new Histogram({
        name: 'nestjs_fail_requests',
        help: 'NestJs fail requests - duration in seconds',
        labelNames: ['handler', 'controller', 'method'],
        buckets: [
          0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1,
          2.5, 5, 10,
        ],
      });
      register.registerMetric(this.requestFailHistogram);
    } else {
      this.requestFailHistogram = register.getSingleMetric('nestjs_fail_requests') as Histogram<string>;
    }

    // requests_failed_count 메트릭 확인
    if (!register.getSingleMetric('nestjs_requests_failed_count')) {
      this.failureCounter = new Counter({
        name: 'nestjs_requests_failed_count',
        help: 'NestJs requests that failed',
        labelNames: ['handler', 'controller', 'error', 'method'],
      });
      register.registerMetric(this.failureCounter);
    } else {
      this.failureCounter = register.getSingleMetric('nestjs_requests_failed_count') as Counter<string>;
    }
  }

  // 성공 시에 시간 재기
  startSuccessTimer(labels: Record<string, string>): () => void {
    if (this.requestSuccessHistogram) {
      console.log('Starting success timer...');
      return this.requestSuccessHistogram.startTimer(labels);
    } else {
      return () => {}; // 빈 함수 리턴
    }
  }

  // 실패 시에 시간 재기
  startFailTimer(labels: Record<string, string>): () => void {
    if (this.requestFailHistogram) {
      console.log('Starting fail timer...');
      return this.requestFailHistogram.startTimer(labels);
    } else {
      console.error('requestFailHistogram is not initialized');
      return () => {}; // 빈 함수 리턴
    }
  }

  // 실패 횟수 상승시키기
  incrementFailureCounter(labels: Record<string, string>, errorMessage: string) {
    if (this.failureCounter) {
      console.log('Incrementing failure counter...');
      this.failureCounter.labels({ ...labels, error: errorMessage }).inc(1);
    } else {
      console.error('failureCounter is not initialized');
    }
  }

  // metrics 수집한 거 등록하기
  async getMetrics(): Promise<string> {
    const metrics = await register.metrics();
    return metrics;
  }
}

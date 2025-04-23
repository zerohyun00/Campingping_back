import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import { IncomingWebhook } from '@slack/webhook';
import * as Sentry from '@sentry/node';
import { HttpException } from '@nestjs/common';

@Injectable()
export class WebhookInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError(async (error) => {
        Sentry.captureException(error);

        // 기본 status는 500
        let status = 500;
        if (error instanceof HttpException) {
          status = error.getStatus();
        }

        // 500번대 에러일 때만 Slack 전송
        if (status >= 500) {
          const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK);
          await webhook.send({
            text: `🚨 *${status} 서버 에러 발생!*`,
            attachments: [
              {
                color: 'danger',
                title: error.message,
                text: error.stack,
              },
            ],
          });
        }

        return throwError(() => error);
      }),
    );
  }
}

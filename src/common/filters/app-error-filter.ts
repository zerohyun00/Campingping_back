import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { AppError } from '../utils/app-error';

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppErrorFilter.name);

  catch(exception: AppError, host: ArgumentsHost) {
    const ctxType = host.getType();

    if (ctxType === 'ws') {
      // WebSocket 예외 처리
      const client = host.switchToWs().getClient();
      client.emit('error', {
        errorType: exception.errorType,
        message: exception.message,
      });
      this.logger.error(
        `WebSocket Error: ${exception.message}`,
        exception.cause?.stack,
      );
    } else {
      // HTTP 예외 처리
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      response.status(exception.httpStatusCode).json({
        statusCode: exception.httpStatusCode,
        errorType: exception.errorType,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });

      this.logger.error(
        `HTTP Error: ${exception.message} - Path: ${request.url}`,
        exception.cause?.stack,
      );
    }
  }
}

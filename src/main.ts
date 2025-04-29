import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppErrorFilter } from './common/filters/app-error-filter';
import { MetricsInterceptor } from './metrics/interseptor/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
import * as Sentry from '@sentry/node';
import { WebhookInterceptor } from './common/interceptor/webhook-interceptor';
import { CampingRepository } from './camping/repository/camping.repository';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  const campingRepository = app.get(CampingRepository);
  await preWarmCache(campingRepository);

  app.useGlobalInterceptors(new WebhookInterceptor());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('캠핑핑')
    .setDescription('캠핑핑 API 명세서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  app.enableCors({
    origin: 'https://campingping.com',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'rsc'], // rsc 헤더 허용
    credentials: true,
  });

  SwaggerModule.setup('api/doc', app, document);

  app.useGlobalInterceptors(new MetricsInterceptor(new MetricsService()));

  app.useGlobalFilters(new AppErrorFilter());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();

async function preWarmCache(campingRepository: CampingRepository) {
  try {
    console.log('🏕️ Pre-warming /campings/lists cache...');
    await campingRepository.findAllWithDetails(); // isFetchAll=true로 호출됨
    console.log('✅ /campings/lists cache pre-warmed successfully!');
  } catch (error) {
    console.error('❌ Pre-warming failed:', error);
  }
}

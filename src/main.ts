import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('캠핑핑')
    .setDescription('캠핑핑 API 명세서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  SwaggerModule.setup('api/doc', app, document);

  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 정의하지 않은 값들은 전부 전달이 안되게 함, dto 에 존재하는값과 존재하지않는 값 구분이 가능
      forbidNonWhitelisted: true, // whitelist에서 걸리면 에러까지 return
      transformOptions: {
        enableImplicitConversion: true, // 클래스에 적혀있는 타입스크립트의 타입을 기반으로 입력값을 변경(알아서 바꿔줌 )
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

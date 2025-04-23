import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class MyConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      port: +this.configService.get<number>('DB_PORT'),
      host: this.configService.get<string>('DB_HOST'),
      database: this.configService.get<string>('DB_DATABASE'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: true,
      synchronize: true,
      cache: {
        type: 'redis',
        options: {
          host: '127.0.0.1',
          port: 6379,
        },
        duration: 60000,
      },
    };
  }
}

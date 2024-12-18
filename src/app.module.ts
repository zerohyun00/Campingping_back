import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyConfigModule } from './config/config.module';
import { MyConfigService } from './config/db';
import { CamppingModule } from './campping/campping.module';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [MyConfigModule],
      useClass: MyConfigService,
      inject: [MyConfigService],
    }),
    CamppingModule,  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

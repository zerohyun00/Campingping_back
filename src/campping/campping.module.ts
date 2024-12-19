import { Module } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingController } from './campping.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { CamppingRepository } from './repository/campping.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campping } from './entities/campping.entity';
import { CamppingCronHandler } from './capping.cron.provider';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Campping]),
    ImageModule,
  ],
  controllers: [CamppingController],
  providers: [CamppingService, CamppingCronHandler, CamppingRepository],
})
export class CamppingModule {}

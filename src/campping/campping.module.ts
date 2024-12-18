import { Module } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingController } from './campping.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { CamppingRepository } from './repository/campping.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campping } from './entities/campping.entity';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Campping])
  ],
  controllers: [CamppingController],
  providers: [CamppingService, CamppingRepository],
})
export class CamppingModule {}

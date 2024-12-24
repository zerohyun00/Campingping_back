import { Module } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingController } from './campping.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CamppingRepository } from './repository/campping.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camping } from './entities/camping.entity';
import { CamppingCronHandler } from './capping.cron.provider';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Camping]),
    ImageModule,
  ],
  controllers: [CamppingController],
  providers: [CamppingService, CamppingCronHandler, CamppingRepository],
  exports: [CamppingService, CamppingRepository],
})
export class CamppingModule {}

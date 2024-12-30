import { Module } from '@nestjs/common';
import { CampingService } from './camping.service';
import { CampingController } from './camping.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CampingRepository } from './repository/camping.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camping } from './entities/camping.entity';
import { CampingCronHandler } from './camping.cron.provider';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Camping]),
    ImageModule,
  ],
  controllers: [CampingController],
  providers: [
    {
      provide: 'ICampingService',
      useClass: CampingService,
    },
    CampingService,
    CampingCronHandler, 
    CampingRepository
  ],
  exports: [CampingService, CampingRepository],
})
export class CampingModule {}

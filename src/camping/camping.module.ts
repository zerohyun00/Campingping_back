import { Module } from '@nestjs/common';
import { CampingService } from './camping.service';
import { CampingController } from './camping.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CampingRepository } from './repository/camping.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camping } from './entities/camping.entity';
import { CampingCronHandler } from './camping.cron.provider';
import { ImageModule } from 'src/image/image.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Camping]),
    ImageModule,
    JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
          }),
        }),
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

import { Module } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingController } from './campping.controller';

@Module({
  controllers: [CamppingController],
  providers: [CamppingService],
})
export class CamppingModule {}

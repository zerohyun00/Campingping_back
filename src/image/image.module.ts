import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { ImageService } from './image.service';
import { ImageRepository } from './repository/image.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), CommonModule],
  controllers: [],
  providers: [ImageService, ImageRepository],
  exports: [ImageService, ImageRepository],
})
export class ImageModule {}

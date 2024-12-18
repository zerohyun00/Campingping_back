import { Module } from '@nestjs/common';
import { MyConfigService } from './db';

@Module({
  providers: [MyConfigService],
})
export class MyConfigModule {}

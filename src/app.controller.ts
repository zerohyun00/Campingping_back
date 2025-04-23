import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('error')
  getError() {
    throw new Error('this is error!!');
  }
}

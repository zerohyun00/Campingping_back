import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('test-db')
export class AppController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async testDBConnection() {
    try {
      await this.dataSource.query('SELECT 1'); // 간단한 쿼리 실행
      console.log('DB 연결 성공!!!',await this.dataSource.query('SELECT 1'));
      return { message: 'DB 연결 성공!!!' };
    } catch (error) {
      console.error('DB 연결 실패:', error);
      return { message: 'DB 연결 실패!', error: error.message };
    }
  }
}
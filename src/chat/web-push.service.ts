import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

@Injectable()
export class WebPushService {
  constructor(private readonly configService: ConfigService) {
    webPush.setVapidDetails(
      'mailto:kyhh39@gmail.com', // VAPID 이메일
      this.configService.get<string>('VAPID_PUBLIC_KEY'),
      this.configService.get<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async sendNotification(subscription: any, payload: any) {
    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
      console.log('[INFO] 웹 푸시 전송 성공');
    } catch (error) {
      console.error('[ERROR] 웹 푸시 전송 실패:', error);
    }
  }
}

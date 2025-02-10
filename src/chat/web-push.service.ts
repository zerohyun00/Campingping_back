import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';

@Injectable()
export class WebPushService {
  constructor() {
    webPush.setVapidDetails(
      'mailto:kyhh39@gmail.com', // VAPID 이메일
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
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

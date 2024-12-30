import * as dayjs from 'dayjs';

export class ApiKeyManager {
    private apiKeys: string[];
    private currentIndex: number;
    private lastUsed: Map<string, dayjs.Dayjs>;
    private resetInterval: number;
    
    constructor(apiKeys: string[], resetInterval: number = 24 * 60 * 60 * 1000) {
      if (apiKeys.length === 0) {
        throw new Error("API 키 배열이 비어 있습니다.");
      }
      this.apiKeys = apiKeys;
      this.currentIndex = 0;
      this.lastUsed = new Map();
      this.resetInterval = resetInterval;
    }
  
    getCurrentApiKey(): string {
      const apiKey = this.apiKeys[this.currentIndex];
      const lastUsedTime = this.lastUsed.get(apiKey) ?? dayjs(0);
      const now = dayjs();

      console.log(`[${now.format('YYYY-MM-DD HH:mm:ss')}] 현재 API 키: ${apiKey}`);

      if (now.diff(lastUsedTime, 'millisecond') > this.resetInterval) {
        this.lastUsed.set(apiKey, now);
        return apiKey;
      }
  
      return apiKey;
    }

    switchToNextApiKey(): boolean {
      const nextIndex = this.currentIndex + 1;
      if (nextIndex < this.apiKeys.length) {
        this.currentIndex = nextIndex;
        const apiKey = this.apiKeys[this.currentIndex];
        const now = dayjs();
        this.lastUsed.set(apiKey, now);
        
        console.log(`[${now.format('YYYY-MM-DD HH:mm:ss')}] API 키 전환: ${apiKey}`); // 사용 시간 포함 로그
        
        return true;
      }
      return false;
    }
}
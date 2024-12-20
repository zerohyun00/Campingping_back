export class ApiKeyManager {
    private apiKeys: string[];
    private currentIndex: number;

    constructor(apiKeys: string[]) {
        if (apiKeys.length === 0) {
            throw new Error("API 키 배열이 비어 있습니다.");
        }
        this.apiKeys = apiKeys;
        this.currentIndex = 0;
    }

    getCurrentApiKey(): string {
        return this.apiKeys[this.currentIndex];
    }

    /**
     * 현재 API 키를 순환하여 다음 API 키로 전환합니다.
     * @returns {boolean} true - 성공적으로 전환, false - 더 이상 사용할 키가 없음
     */
    switchToNextApiKey(): boolean {
        if (this.currentIndex < this.apiKeys.length - 1) {
            console.log("api 매니저 !")
            this.currentIndex++;
            return true;
        }
        return false;
    }
}
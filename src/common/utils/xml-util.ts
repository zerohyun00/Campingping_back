import { parseStringPromise } from 'xml2js';

export class XmlUtils {
  static isXmlResponse(data: any): boolean {
    return typeof data === 'string' && data.trim().startsWith('<');
  }

  static async handleXmlError(errorXml: string, apikey: string, apiKeyManager: any): Promise<boolean> {
    try {
      const parsedError = await parseStringPromise(errorXml, { explicitArray: false });
      const returnReasonCode = parsedError?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnReasonCode;
      
      if (returnReasonCode === '22') {
        console.warn(`API 키 사용 초과: ${apikey}`);
        if (!apiKeyManager.switchToNextApiKey()) {
          console.error('모든 API 키 사용 초과');
          return false;
        }
        console.log(`새로운 API 키로 전환: ${apiKeyManager.getCurrentApiKey()}`);
        return true;
      } else {
        console.error('기타 XML 오류:', parsedError);
        return false;
      }
    } catch (parseError) {
      console.error('XML 파싱 오류:', parseError);
      return false;
    }
  }
}
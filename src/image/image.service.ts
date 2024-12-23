import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ImageRepository } from "./repository/image.repository";
import { parseStringPromise } from "xml2js";
import { ApiKeyManager } from "src/common/utils/api-manager";

@Injectable()
export class ImageService {
    private apiKeyManager: ApiKeyManager;

    constructor(private imageRepository: ImageRepository) {
        // 수정 필요
        this.apiKeyManager = new ApiKeyManager([
            'xmrpgObsiAFFR2II2Mr%2BABk2SHPyB21kt%2Ft0Y6g4mMndM3J0b3KDmM2TTsySRE6Cpuo0Q8cBNt2aQ5%2BX1woPyA%3D%3D',
            'TapmaDwOM%2FvvIzD2GYx%2F6RfNoMM1ES3NQbgRwQeVG31NEu5JDY7vWU41293qYDR51IrpaKtbgAuYzJseIBhx2A%3D%3D',
            'FZ4frpQMulmr31of%2BdrKJkS9c99ziib5T%2BMJyqhp3kFnAHkw%2FR0URVDqItzaYurITyEJ3B%2BK%2BLtnNNmeVMfYFA%3D%3D',
            'WVXbHaU1Swo%2BcYdMpg2hDAaLjs3Vehe3CBCsgOR63iQf%2FWqVv%2BeuKKq%2Bs8uOhS4%2B1bwL4VwhxS1%2F0WUOgmklag%3D%3D',
            '20ToNqK21emRg6djV5ZFRNzl%2BGVnIEHdUoewEghzPlmop90s0dTK3sSnW%2FjdHqN1fF1lFrE96WK1ypYHhLuS6Q%3D%3D',
            'fR5r78vDyLa5VlMt5YTpJRUGjXoWDMk6ZQmB2LPtYHAHw%2F7mdvoXpnkrz7OuOB2JJH%2FOtbvUbmtUS%2FiPGGwoxQ%3D%3D',
        ]);
    }

    async ImageCronHandler(contentId: string) {
        const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
        const numOfRows = 10;
        let pageNo = 1;
        let allImages = [];
    
        while (true) {
            const apikey = this.apiKeyManager.getCurrentApiKey();  // 현재 API 키
            const url = `${apiurl}/imageList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&contentId=${contentId}&_type=json`;
    
            try {
                const response = await axios.get(url);
    
                const responseBody = response.data?.response?.body;
    
                // 응답 데이터 확인
                if (!responseBody || !responseBody.items || responseBody.items === '') {
                    console.log(`처리할 이미지가 없습니다 (페이지: ${pageNo})`);
                    console.log("응답 데이터:", response.data); // 응답 전체 데이터를 로깅하여 확인
                    
                    // 응답이 XML인지 확인
                    if (response.data && typeof response.data === 'string' && response.data.trim().startsWith('<')) {
                        // XML 형식인 경우
                        const errorXml = response.data;
                        console.log(errorXml, "에러떴을경우");
                        
                        try {
                            const parsedError = await parseStringPromise(errorXml, { explicitArray: false });
                            const returnReasonCode = parsedError?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnReasonCode;
                
                            if (returnReasonCode === '22') {
                                console.warn(`API 키 사용 초과: ${apikey}, 이유: ${parsedError?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnAuthMsg}`);
                                
                                // API 키 변경 및 재시도
                                if (!this.apiKeyManager.switchToNextApiKey()) {
                                    console.error("모든 API 키 사용 초과");
                                    break;  // 더 이상 재시도할 API 키가 없으면 종료
                                }
                                console.log(`새로운 API 키로 전환: ${this.apiKeyManager.getCurrentApiKey()}`);
                                continue;  // 새로운 API 키로 재시도
                            }
                        } catch (parseError) {
                            console.error('XML 파싱 오류:', parseError);
                        }
                    } else {
                        console.error("응답 데이터가 예상한 XML 형식이 아닙니다.");
                    }
                
                    break;  // 이미지가 없으면 종료
                }
    
                const images = responseBody.items.item || [];
                console.log(`현재 페이지: ${pageNo}, 받은 이미지 데이터 수: ${images.length}`);
                allImages = allImages.concat(images);
                pageNo++;
    
            } catch (error) {
                console.error('API 요청 중 오류 발생:', error);
                break;
            }
        }
    
        // 이미지를 DB에 저장
        for (const image of allImages) {
            try {
                const existingImage = await this.imageRepository.findOne(contentId, image.imageUrl);
    
                if (existingImage) {
                    console.log(`이미 존재하는 이미지: ${image.imageUrl}`);
                    continue;
                }
    
                await this.imageRepository.createImage(contentId, image.imageUrl, 'CAMPPING');
                console.log(`이미지 저장 완료: ${image.imageUrl}`);
            } catch (error) {
                console.error(`이미지 저장 중 오류 발생: ${image.imageUrl}`, error);
            }
        }
    }
}
import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ImageRepository } from "./repository/image.repository";


@Injectable()
export class ImageService {
    constructor(private imageRepository: ImageRepository){}
    async ImageCronHandler(contentId: string){
        const apikey = 'TapmaDwOM%2FvvIzD2GYx%2F6RfNoMM1ES3NQbgRwQeVG31NEu5JDY7vWU41293qYDR51IrpaKtbgAuYzJseIBhx2A%3D%3D';
        const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
        const numOfRows = 100;
        let pageNo = 1;
        let allImages = [];
        while (true) {
            const url = `${apiurl}/imageList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&contentId=${contentId}&_type=json`;
            try {
                const response = await axios.get(url);
                console.log(response.data, "데이터?")
                const images = response.data.response.body.items.item;
                if (!images || images.length === 0) {
                    console.log('처리할 이미지가 없습니다');
                    break;
                }
                console.log(`현재 페이지: ${pageNo}, 받은 이미지 데이터 수: ${images.length}`);

                allImages = allImages.concat(images);
                pageNo++;
            } catch (error) {
                console.error('이미지 요청 중 오류 발생:', error.data.response);
                break;
            }
        }
        for (const image of allImages) {
            try {
                // contentId와 imageUrl이 중복되지 않도록 확인
                const existingImage = await this.imageRepository.findOne(contentId,  image.imageUrl);

                if (existingImage) {
                    console.log(`이미 존재하는 이미지: ${image.imageUrl}`);
                    continue; // 중복된 이미지가 있으면 건너뜀
                }

                // 중복되지 않으면 새 이미지 저장
                await this.imageRepository.createImage(contentId, image.imageUrl, 'CAMPPING');
                console.log(`이미지 저장 완료: ${image.imageUrl}`);
            } catch (error) {
                console.error(`이미지 저장 중 오류 발생: ${image.imageUrl}`, error);
            }
        }
    }
}
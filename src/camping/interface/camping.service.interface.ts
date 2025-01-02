import { ImageDataType } from "src/image/type/image.data-type";
import { CampingParamDto } from "../dto/find-camping-param.dto";
import { Camping } from "../entities/camping.entity";
import { CampingDetailType } from "../type/camping-detail.type";
import { CampingListType } from "../type/camping-list-type";
import { NearbyCampingType } from "../type/camping-near-map.type";

export interface ICampingService {
    campingCronHandler():Promise<void>;
    findAllForCron():Promise<Camping[]>;
    findAllWithDetails(limit: number, cursor?: number, region?: string, category?: string): unknown;
    findOne(paramDto: CampingParamDto): unknown;
    findNearbyCamping(lon: number, lat: number): unknown;
}
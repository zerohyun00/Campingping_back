import { CampingParamDto } from "../dto/find-camping-param.dto";
import { Camping } from "../entities/camping.entity";
import { CampingfindOneType } from "../type/camping-detail.type";
import { CampingWithDetails } from "../type/camping-list-type";
import { NearbyCampingResType } from "../type/camping-near-map.type";


export interface ICampingService {
    campingCronHandler():Promise<string[]>;
    findAllForCron():Promise<Camping[]>;
    findAllWithDetails(limit: number, cursor?: number, region?: string, category?: string, userId?: string): Promise<CampingWithDetails>;
    findOne(paramDto: CampingParamDto): Promise<CampingfindOneType>;
    findNearbyCamping(lon: number, lat: number, userId?: string):Promise <NearbyCampingResType[]>;
}
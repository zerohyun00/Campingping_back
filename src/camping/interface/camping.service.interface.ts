import { CampingParamDto } from "../dto/find-camping-param.dto";
import { Camping } from "../entities/camping.entity";

export interface ICampingService {
    campingCronHandler():Promise<void>;
    findAllForCron():Promise<Camping[]>;
    findAllWithDetails(limit: number, cursor?: number, region?: string, category?: string):Promise<Camping[]>;
    findOne(paramDto: CampingParamDto): Promise<Camping>;
    findNearbyCamping(lon: number, lat: number): Promise<Camping[]>;
}
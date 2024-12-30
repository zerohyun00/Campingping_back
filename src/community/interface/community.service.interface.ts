import { CreateCommunityDto } from "../dto/create-community.dto";
import { UpdateCommunityDto } from "../dto/update-community.dto";
import { Community } from "../entities/community.entity";

export interface ICommunityService {
    createPost(createCommunityDto: CreateCommunityDto, userId: string): Promise<Community>;
    findAll(lon: number, lat: number, limit: number, cursor: number): Promise<Community[]>;
    findOne(id: number): Promise<Community>;
    updatePost(id: number, updateCommunityDto: UpdateCommunityDto, userId: string): Promise<{message: string}>;
    deletePost(id: number, userId: string): Promise<{message: string}>;
}
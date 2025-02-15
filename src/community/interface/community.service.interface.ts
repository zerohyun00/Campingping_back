import { Camping } from "src/camping/entities/camping.entity";
import { CreateCommunityDto } from "../dto/create-community.dto";
import { FindResponseDto } from "../dto/find-community.response.dto";
import { UpdateCommunityDto } from "../dto/update-community.dto";
import { Community } from "../entities/community.entity";

export interface ICommunityService {
    createPost(createCommunityDto: CreateCommunityDto, userId: string): Promise<Community>;
    findAll(lon: number, lat: number, limit: number, cursor: number): Promise<{result: FindResponseDto[] , nextCursor: number}>;
    getMyPost(limit: number, cursor: number, userId: string): Promise<{result: FindResponseDto[] , nextCursor: number}>;
    findOne(id: number): Promise<Community>;
    updatePost(id: number, updateCommunityDto: UpdateCommunityDto, userId: string): Promise<{message: string}>;
    deletePost(id: number, userId: string): Promise<{message: string}>;
}
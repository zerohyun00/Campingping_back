import { CreateFavoriteDto } from "../dto/create-favorite.dto";

export interface IFavoriteService {
    getUserFavorites(userId: string): Promise<string>;
    createFavorite(userId: string, dto: CreateFavoriteDto): Promise<string>;
}
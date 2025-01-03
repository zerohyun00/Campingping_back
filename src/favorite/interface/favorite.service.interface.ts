import { CreateFavoriteDto } from "../dto/create-favorite.dto";
import { Favorite } from "../entities/favorite.entity";

export interface IFavoriteService {
    getUserFavorites(userId: string): Promise<Favorite[]>;
    createFavorite(userId: string, dto: CreateFavoriteDto): Promise<string>;
}
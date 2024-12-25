import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Camping } from 'src/camping/entities/camping.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Camping)
    private readonly campingRepository: Repository<Camping>,
  ) {}

  async getUserFavorites(userId: string) {
    const favorites = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect(
        'camping',
        'camping',
        'favorite.contentId = camping.contentId',
      )
      .leftJoin('Image', 'image', 'favorite.contentId = image.typeId')
      .where('favorite.user.id = :userId', { userId })
      .andWhere('favorite.status = :status', { status: true })
      .select([
        'favorite.id',
        'camping.contentId',
        'camping.factDivNm as campingName',
        'camping.addr1',
        'camping.lineIntro',
        'camping.intro',
        'image.url',
      ])
      .distinctOn(['favorite.contentId'])
      .orderBy('favorite.contentId, image.id', 'ASC')
      .getRawMany();

    return favorites;
  }

  async createFavorite(userId: string, dto: CreateFavoriteDto) {
    const { contentId, status } = dto;

    // 1. 캠핑장 정보 확인
    const camping = await this.campingRepository.findOne({
      where: { contentId },
    });

    if (!camping) {
      throw new NotFoundException('해당 캠핑장을 찾을 수 없습니다.');
    }

    // 2. 즐겨찾기 확인 및 상태 업데이트
    const favorite = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', { userId })
      .andWhere('favorite.contentId = :contentId', { contentId })
      .getOne();

    if (favorite) {
      // 이미 존재하는 즐겨찾기를 업데이트
      await this.favoriteRepository
        .createQueryBuilder()
        .update(Favorite)
        .set({ status })
        .where('id = :id', { id: favorite.id })
        .execute();

      return {
        ...favorite,
        status,
      };
    } else {
      // 새로운 즐겨찾기를 추가
      const insertResult = await this.favoriteRepository
        .createQueryBuilder()
        .insert()
        .into(Favorite)
        .values({
          user: { id: userId },
          contentId,
          status,
        })
        .returning(['id', 'contentId', 'status'])
        .execute();
      return {
        ...insertResult.raw[0],
      };
    }
  }
}

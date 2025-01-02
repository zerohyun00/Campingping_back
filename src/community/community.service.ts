import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Geometry, Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { User } from 'src/user/entities/user.entity';
import { FindResponseDto } from './dto/find-community.response.dto';
import { ICommunityService } from './interface/community.service.interface';

@Injectable()
export class CommunityService implements ICommunityService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createCommunityDto: CreateCommunityDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
   
    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    const coordinate: Geometry = {
      type: 'Point',
      coordinates: [createCommunityDto.lon, createCommunityDto.lat],
    };

    const post = this.communityRepository.create({
      ...createCommunityDto,
      coordinate,
      user,
    });

    return this.communityRepository.save(post);
  }

  async findAll(lon: number, lat: number, limit: number, cursor: number) {
    const query = this.communityRepository    
      .createQueryBuilder('community')
      .select([
        'community.id AS id',
        'community.title AS title',
        'community.content AS content',
        'community.location AS location',
        'community.people AS people',
        'community.startDate AS startDate',
        'community.endDate AS endDate',
        'community.view AS view',
        'ST_AsGeoJSON(community.coordinate) as coordinate',
        '(ST_Distance(community.coordinate, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) * 111000) as distance',
        'user.email AS email',
        'user.nickname AS nickname',
      ])
      .leftJoin('user', 'user', "community.user = user.id")
      .setParameters({ lat, lon })
      .where(
        '(ST_Distance(community.coordinate, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) * 111000) <= 1500',
      )
      .andWhere('community.deletedAt IS NULL')
      .orderBy('distance', 'ASC')
      
      if (cursor) {
        query.andWhere('community.id > :cursor', { cursor });
      }
    
      query.limit(limit && limit > 0 ? limit : 10);
  
      const result = await query.getRawMany();
      const nextCursor = result.length > 0 ? result[result.length - 1].id : null;

      return {
        result: FindResponseDto.allList(result), 
        nextCursor,
      };
    }

  async findOne(id: number) {
    const result = await this.communityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (result) {
      result.view += 1;
      await this.communityRepository.save(result);
    }
    return result;
  }

  async updatePost(
    id: number,
    updateCommunityDto: UpdateCommunityDto,
    userId: string,
  ) {
    const updateResult = await this.communityRepository
    .createQueryBuilder()
    .update()
    .set(updateCommunityDto)
    .where('id = :id', { id })
    .andWhere('userId = :userId', { userId })
    .andWhere('deletedAt IS NULL')
    .execute();

    if (updateResult.affected === 0) {
      throw new NotFoundException(
        '게시글을 찾을 수 없거나 본인이 작성한 게시글만 수정할 수 있습니다.',
      );
    }

    return {
      message: '게시글이 성공적으로 수정되었습니다.',
    };
  }

  async deletePost(id: number, userId: string) {
    const deleteResult = await this.communityRepository
    .createQueryBuilder()
    .softDelete()
    .where('id = :id', { id })
    .andWhere('userId = :userId', { userId })
    .andWhere('deletedAt IS NULL')
    .execute();

    if (deleteResult.affected === 0) {
      throw new NotFoundException(
        '게시글을 찾을 수 없거나 본인이 작성한 게시글만 삭제할 수 있습니다.',
      );
    }

    return { message: '게시글이 성공적으로 삭제되었습니다.' };
  }
}

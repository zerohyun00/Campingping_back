import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityDto } from './create-community.dto';
import { ApiProperty } from '@nestjs/swagger'; 

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {
    @ApiProperty({
        description: '커뮤니티 제목',
        example: '캠핑 커뮤니티',
        required: false,
      })
      title?: string;
    
      @ApiProperty({
        description: '커뮤니티 내용',
        example: '캠핑 장소와 관련된 모든 정보를 공유하세요!',
        required: false,
      })
      content?: string;
    
      @ApiProperty({
        description: '커뮤니티 위치',
        example: '서울',
        required: false,
      })
      location?: string;
    
      @ApiProperty({
        description: '참여 가능한 인원 수',
        example: 20,
        required: false,
      })
      people?: number;
    
      @ApiProperty({
        description: '커뮤니티 시작 날짜',
        example: '2024-01-01T10:00:00Z',
        required: false,
      })
      startDate?: Date;
    
      @ApiProperty({
        description: '커뮤니티 종료 날짜',
        example: '2024-01-03T10:00:00Z',
        required: false,
      })
      endDate?: Date;
    
      @ApiProperty({
        description: '경도 (longitude)',
        example: 126.9780,
        required: false,
      })
      lon?: number;
    
      @ApiProperty({
        description: '위도 (latitude)',
        example: 37.5665,
        required: false,
      })
      lat?: number;
}

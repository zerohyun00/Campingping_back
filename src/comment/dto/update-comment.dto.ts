import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentsDto } from './create-comment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentsDto extends PartialType(CreateCommentsDto) {
    @ApiProperty({
        description: '댓글 내용',
        example: '수정된 댓글 내용입니다.',
        required: false,
    })
    content?: string;
}

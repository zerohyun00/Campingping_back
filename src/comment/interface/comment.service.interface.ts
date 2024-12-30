import { PagePaginationDto } from "src/common/dto/page-pagination.dto";
import { CreateCommentsDto } from "../dto/create-comment.dto";
import { UpdateCommentsDto } from "../dto/update-comment.dto";

export interface ICommentService {
    findAllCommentsOfCommunity(communityId: number, paginationDto: PagePaginationDto): Promise<Comment[]>;
    createComment(dto: CreateCommentsDto, communityId: number, userId: string): Promise<{message: string}>;
    updateComment( communityId: number, commentId: number, dto: UpdateCommentsDto): Promise<Comment>;
    deleteComment(communityId: number, commentId: number): Promise<void>;
    isCommentMine(userId: string, commentId: number): Promise<string>;
}
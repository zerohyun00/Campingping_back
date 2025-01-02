import { PagePaginationDto } from "src/common/dto/page-pagination.dto";
import { CreateCommentsDto } from "../dto/create-comment.dto";
import { UpdateCommentsDto } from "../dto/update-comment.dto";
import { FindCommentDto } from "../dto/find-comment.dto";

export interface ICommentService {
    findAllCommentsOfCommunity(communityId: number, paginationDto: PagePaginationDto): Promise<{comments: FindCommentDto[], meta: { total: number; page: number; take: number; totalPages: number; };}>;
    createComment(dto: CreateCommentsDto, communityId: number, userId: string): Promise<{message: string}>;
    updateComment( communityId: number, commentId: number, dto: UpdateCommentsDto): Promise<{message: string}>;
    deleteComment(communityId: number, commentId: number): Promise<void>;
    isCommentMine(userId: string, commentId: number): Promise<boolean>;
}
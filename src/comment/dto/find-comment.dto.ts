import { Comment } from "../entities/comment.entity";
import { commentFindType } from "../type/comment-find.type";

export class FindCommentDto {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user:{ email: string, nickname: string, profilUrl: string};
    constructor(comment: commentFindType){
        this.id = comment.comment_id;
        this.content = comment.comment_content;
        this.createdAt = comment.comment_createdAt;
        this.updatedAt = comment.comment_updatedAt;
        this.user = {email: comment.user_email, nickname: comment.user_nickname, profilUrl: comment.image_url}
    }
    static allList(
        comments: commentFindType[], 
        { total, page, take }: { total: number, page: number, take: number }
      ): { comments: FindCommentDto[], meta: { total: number, page: number, take: number, totalPages: number } } {
        const totalPages = Math.ceil(total / take); // 총 페이지 수 계산
        return {
          comments: comments.map((comment) => new FindCommentDto(comment)),
          meta: {
            total,
            page,
            take,
            totalPages, // totalPages를 메타에 포함
          },
        };
      }
    }
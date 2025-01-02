import { Comment } from "../entities/comment.entity";

export class FindCommentDto {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user:{ email: string, nickname: string};
    constructor(comment: Comment){
        this.id = comment.id;
        this.content = comment.content;
        this.createdAt = comment.createdAt;
        this.updatedAt = comment.updatedAt;
        this.user = {email: comment.user.email, nickname: comment.user.nickname}
    }
    static allList(
        comments: Comment[], 
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
export type commentFindType = {
    comment_id: number;
    comment_content: string;
    comment_createdAt: Date;
    comment_updatedAt: Date;
    user_email: string, user_nickname: string;
    image_url: string;
}
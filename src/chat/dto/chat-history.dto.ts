export type ChatHistoryDto = {
  message: string;
  createdAt: Date;
  isRead: boolean;
  id: number;
  author: {
    email: string;
    nickname: string;
  };
};

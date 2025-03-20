export type ChatHistoryDto = {
  message: string;
  createdAt: string;
  isRead: boolean;
  id: number;
  author: {
    email: string;
    nickname: string;
  };
};

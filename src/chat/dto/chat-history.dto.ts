export type ChatHistoryDto = {
  message: string;
  createdAt: string;
  isRead: boolean;
  author: {
    email: string;
    nickname: string;
  };
};

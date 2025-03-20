export type ChatResType = {
  roomId: number;
  createdAt: Date;
  users: { email: string; nickname: string }[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
};

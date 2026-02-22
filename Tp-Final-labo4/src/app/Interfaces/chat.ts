export interface Conversation {
   id?: string | number;

  userAId: string | number;
  userBId: string | number;

  lastMessage?: string;
  updatedAt?: string;
}

export interface ChatMessage {

  id?: string | number;

  userAId: string | number;
  userBId: string | number;

  senderId: string | number;

  content: string;

  createdAt: string;
}
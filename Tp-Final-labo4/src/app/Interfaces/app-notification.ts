export interface AppNotification {
    id?: number | string;
  userId: number | string;
  fromUserId: number | string;
  type: 'like' | 'follow' | 'comment';
  referenceId: number | string;
  message: string;
  read: boolean;
  createdAt: string;
}

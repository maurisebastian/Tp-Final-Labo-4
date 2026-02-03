export interface Notification {

  id?: number;
  userId: number;           // usuario que recibe la notificación
  fromUserId: number;           // usuario que genera la acción
  type: 'like' | 'follow' | 'comment';
  referenceId: number;       // id de review o perfil
  message: string;
  read: boolean;
  createdAt: string;
}


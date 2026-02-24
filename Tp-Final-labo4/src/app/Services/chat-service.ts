import { inject, Injectable } from '@angular/core';
import { ChatMessage, Conversation } from '../Interfaces/chat';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private baseUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  private messagesUrl = `${this.baseUrl}/messages`;
  private conversationsUrl = `${this.baseUrl}/conversations`;


  // Normalizar usuarios
  private normalizeUsers(a: any, b: any) {
    return a < b
      ? { userAId: a, userBId: b }
      : { userAId: b, userBId: a };
  }

  // GET MENSAJES ENTRE DOS USERS
 
  getConversation(userAId: string | number, userBId: string | number) {

    const ids = this.normalizeUsers(userAId, userBId);

    return this.http.get<ChatMessage[]>(this.messagesUrl).pipe(
      map(list =>
        list
          .filter(m =>
            m.userAId == ids.userAId &&
            m.userBId == ids.userBId
          )
          .sort((a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          )
      )
    );
  }

  // ENVIAR MENSAJE

  sendMessage(message: ChatMessage) {

    const ids = this.normalizeUsers(message.userAId, message.userBId);

    message.userAId = ids.userAId;
    message.userBId = ids.userBId;
    message.read = false; 

    return this.http.post<ChatMessage>(this.messagesUrl, message).pipe(
      switchMap(() => this.updateConversation(message))
    );
  }

 getAllMessages() {
  return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages`);
}

  // CREAR / ACTUALIZAR CONVERSACIÓN

  private updateConversation(msg: ChatMessage) {

    const { userAId, userBId, content } = msg;

    return this.http.get<Conversation[]>(
      `${this.conversationsUrl}?userAId=${userAId}&userBId=${userBId}`
    ).pipe(

      switchMap(list => {

        const now = new Date().toISOString();

        if (list.length > 0) {
          const conv = list[0];

          return this.http.patch(
            `${this.conversationsUrl}/${conv.id}`,
            {
              lastMessage: content,
              updatedAt: now
            }
          );
        }

        const newConv: Conversation = {
          userAId,
          userBId,
          lastMessage: content,
          updatedAt: now
        };

        return this.http.post(this.conversationsUrl, newConv);
      })
    );
  }

  // LISTA DE CONVERSACIONES DE UN USER

  getConversationsByUser(userId: string | number) {
    return this.http.get<Conversation[]>(this.conversationsUrl).pipe(
      map(list =>
        list.filter(c =>
          c.userAId == userId || c.userBId == userId
        )
      )
    );
  }

  // contador de no leidos

  getUnreadCount(userId: string | number) {
  return this.http.get<ChatMessage[]>(this.messagesUrl).pipe(
    map(list =>
      list.filter(m =>
        m.senderId != userId &&
        (m.userAId == userId || m.userBId == userId) &&
        !m.read
      ).length
    )
  );
}

// marcar como leido 

  markAsRead(userId: string | number, friendId: string | number) {

  const ids = this.normalizeUsers(userId, friendId);

  return this.http.get<ChatMessage[]>(this.messagesUrl).pipe(
    switchMap(list => {

      const unread = list.filter(m =>
        m.userAId == ids.userAId &&
        m.userBId == ids.userBId &&
        m.senderId != userId &&
        !m.read
      );

      const updates = unread.map(m =>
        this.http.patch(`${this.messagesUrl}/${m.id}`, { read: true })
      );

      return forkJoin(updates);
    })
  );
}

}

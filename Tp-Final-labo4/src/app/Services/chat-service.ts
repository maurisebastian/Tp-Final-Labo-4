import { inject, Injectable } from '@angular/core';
import { ChatMessage, Conversation } from '../Interfaces/chat';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private baseUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  getConversationsByUser(userId: string | number) {
    return this.http.get<Conversation[]>(
      `${this.baseUrl}/conversations?userAId=${userId}&_expand=user`
    );
  }

  getMessages(conversationId: string | number) {
    return this.http.get<ChatMessage[]>(
      `${this.baseUrl}/messages?conversationId=${conversationId}&_sort=createdAt`
    );
  }

  getConversation(userAId: string | number, userBId: string | number) {
    return this.http.get<ChatMessage[]>(this.baseUrl).pipe(
      map(list =>
        list.filter(m =>
          (m.userAId == userAId && m.userBId == userBId) ||
          (m.userAId == userBId && m.userBId == userAId)
        )
      )
    );
  }


  sendMessage(message: ChatMessage) {
    return this.http.post<ChatMessage>(`${this.baseUrl}/messages`, message);
  }


}

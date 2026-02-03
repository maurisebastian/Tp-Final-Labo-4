import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    private baseUrl = 'http://localhost:3000/notifications';
  private http = inject(HttpClient);

  getByUser(userId: number) {
    return this.http.get<Notification[]>(
      `${this.baseUrl}?userId=${userId}&_sort=createdAt&_order=desc`
    );
  }

  create(notification: Notification) {
    return this.http.post<Notification>(this.baseUrl, notification);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.baseUrl}/${id}`, { read: true });
  }

  
}

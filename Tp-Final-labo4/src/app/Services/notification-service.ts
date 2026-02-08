import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppNotification } from '../Interfaces/app-notification';



@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    private baseUrl = 'http://localhost:3000/notifications';
  private http = inject(HttpClient);

  getByUser(userId: number) {
    return this.http.get<AppNotification[]>(
      `${this.baseUrl}?userId=${userId}&_sort=createdAt&_order=desc`
    );
  }

  create(notification: AppNotification) {
    return this.http.post<AppNotification>(this.baseUrl, notification);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.baseUrl}/${id}`, { read: true });
  }
  
}

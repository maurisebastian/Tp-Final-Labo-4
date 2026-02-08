import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppNotification } from '../Interfaces/app-notification';
import { forkJoin,of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'http://localhost:3000/notifications';
  private http = inject(HttpClient);

  getByUser(userId: number | string) {
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

  markAllAsRead(userId: string | number, list: AppNotification[]) {
    const pending = list
      .filter(n => !n.read)
      .map(n => this.markAsRead(n.id as any));

    return pending.length ? forkJoin(pending) : of([]);
  }

  delete(id: string | number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}

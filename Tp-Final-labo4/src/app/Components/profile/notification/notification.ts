import { Component, computed, effect, inject, signal } from '@angular/core';
import { AppNotification } from '../../../Interfaces/app-notification';
import { AuthService } from '../../../auth/auth-service';
import { NotificationService } from '../../../Services/notification-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification {

  private auth = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  activeUser = this.auth.getActiveUser();

  notifications = signal<AppNotification[]>([]);
  loading = signal(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor() {
    effect(() => {
      const user = this.activeUser();
      if (!user?.id) {
        this.notifications.set([]);
        return;
      }

      this.loading.set(true);
      this.notifService.getByUser(user.id as any).subscribe({
        next: (list) => {
          this.notifications.set(list ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.notifications.set([]);
          this.loading.set(false);
        }
      });
    });
  }

  markOneAsRead(n: AppNotification, ev?: Event) {
    ev?.stopPropagation();
    if (!n.id || n.read) return;

    this.notifService.markAsRead(n.id as any).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(x => x.id === n.id ? { ...x, read: true } : x)
        );
      }
    });
  }

  markAllAsRead() {
    const user = this.activeUser();
    if (!user?.id) return;

    const list = this.notifications();
    this.notifService.markAllAsRead(user.id as any, list).subscribe({
      next: () => {
        this.notifications.update(arr => arr.map(n => ({ ...n, read: true })));
      }
    });
  }

  deleteOne(n: AppNotification, ev?: Event) {
    ev?.stopPropagation();
    if (!n.id) return;

    this.notifService.delete(n.id as any).subscribe({
      next: () => {
        this.notifications.update(arr => arr.filter(x => x.id !== n.id));
      }
    });
  }

  openNotification(n: AppNotification) {
   // marcar como leída al abrir
  this.markOneAsRead(n);

  if (n.type === 'follow') {
    this.router.navigate(['/profiles', n.fromUserId]);
    return;
  }

  if (n.type === 'like' || n.type === 'comment') {
    if (n.movieId != null) {
      this.router.navigate(['/movie-review', n.movieId]);
      return;
    }

    // fallback si por alguna razón falta movieId
    this.router.navigate(['/profiles', n.fromUserId]);
    return;
  }

  this.router.navigate(['/']);
  }

  trackById = (_: number, n: AppNotification) => n.id ?? `${n.type}-${n.createdAt}`;

}

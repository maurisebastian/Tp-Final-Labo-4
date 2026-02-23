import { Component, computed, effect, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';
import { NotificationService } from '../../Services/notification-service';
import { AppNotification } from '../../Interfaces/app-notification';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../Services/chat-service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css'],
})
export class TopBar {

  private fb = inject(FormBuilder);
  router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  

  // usuario logueado (signal)
  activeUserSignal = this.authService.getActiveUser();

  // control de búsqueda
  busqueda = this.fb.nonNullable.control('', {
    validators: [Validators.required],
  });

  //  guardo lista de notificaciones en un signal
  private notifications = signal<AppNotification[]>([]);

  //  contador de no leídas (signal computado)
  unreadCount = computed(() =>
    this.notifications().filter((n) => !n.read).length
  );

   unreadChat = signal(0);


  constructor() {
    //  cada vez que cambie el usuario logueado, recargo notificaciones
    effect(() => {
      const user = this.activeUserSignal();
      if (!user) {
        this.notifications.set([]);
        return;
      }

      this.notificationService.getByUser(user.id as any).subscribe({
        next: (list) => this.notifications.set(list ?? []),
        error: () => this.notifications.set([]),
      });

      this.chatService.getUnreadCount(user.id!)
        .subscribe(count => this.unreadChat.set(count));

    });
  }


  // buscar película
  buscar() {
    const value = this.busqueda.value.trim();

    if (!value) {
      this.busqueda.setErrors({ required: true });
      this.busqueda.markAsTouched();
      return;
    }

    this.router.navigate(['/search', value]);
  }

  goToEditProfile() {
    const user = this.activeUserSignal();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/profile-detail'], {
      queryParams: { edit: true }
    });
  }

}

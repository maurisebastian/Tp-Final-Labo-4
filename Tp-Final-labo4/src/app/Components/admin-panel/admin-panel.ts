import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfileService } from '../../Services/profile.service';
import { Profile } from '../../Interfaces/profilein';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {

  private profileService = inject(ProfileService);
  private router = inject(Router);
  private authService = inject(AuthService);

  activeUserSignal = this.authService.getActiveUser();

  users: Profile[] = [];

  ngOnInit(): void {
    const active = this.activeUserSignal();
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.profileService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
  }

  goToEditUser(user: Profile) {
    if (!user.id) return;
    this.router.navigate(['/admin/user', user.id]);
  }

  deleteUser(user: Profile) {
    if (!user.id) return;

    const active = this.activeUserSignal();

    if (user.role === 'superadmin') {
      alert('No se puede eliminar al Administrador Principal.');
      return;
    }

    if (active && active.id === user.id) {
      alert('No podés eliminar tu propio usuario.');
      return;
    }

    const ok = confirm(`¿Seguro que querés eliminar al usuario "${user.username}"?`);
    if (!ok) return;

    this.profileService.deleteUser(user.id).subscribe((result) => {
      if (result) {
        this.users = this.users.filter((u) => u.id !== user.id);
      } else {
        alert('No se pudo eliminar el usuario.');
      }
    });
  }
}

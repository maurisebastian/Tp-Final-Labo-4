import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { Profile } from '../../Interfaces/profilein';
import { AuthService } from '../../auth/auth-service';
import { ConfimDialog } from "../../Shared/confim-dialog/confim-dialog";

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfimDialog],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {

  private profileService = inject(ProfileService);
  private router = inject(Router);
  private authService = inject(AuthService);

  activeUserSignal = this.authService.getActiveUser();

  users: Profile[] = [];
  filteredUsers: Profile[] = [];

  dialogTitle = "";
dialogDescription = "";
pendingAction: (() => void) | null = null;

@ViewChild('confirmDialog') confirmDialog!: any;

openConfirm(title: string, description: string, action: (() => void) | null) {
  this.dialogTitle = title;
  this.dialogDescription = description;
  this.pendingAction = action;

  this.confirmDialog.open();
}

executePendingAction() {
  if (this.pendingAction) this.pendingAction();
  this.pendingAction = null;
}

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
      this.filteredUsers = users;
    });
  }

  onSearch(value: string) {
    const term = value.trim().toLowerCase();

    if (!term) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter((u) => {
      return (
        (u.username?.toLowerCase().includes(term)) ||
        (u.email?.toLowerCase().includes(term)) ||
        (String(u.id).includes(term))
      );
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
    this.openConfirm(
      "No permitido",
      "No se puede eliminar al Administrador Principal.",
      null
    );
    return;
  }

  if (active && active.id === user.id) {
    this.openConfirm(
      "Acción bloqueada",
      "No podés eliminar tu propio usuario.",
      null
    );
    return;
  }

  // 🔥 CONFIRMACIÓN REAL
  this.openConfirm(
    "Eliminar usuario",
    `¿Seguro que querés eliminar a "${user.username}"?`,
    () => {
      this.profileService.deleteUser(String(user.id)).subscribe((result) => {
        if (result) {
          this.users = this.users.filter((u) => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
        } else {
          this.openConfirm(
            "Error",
            "No se pudo eliminar el usuario.",
            null
          );
        }
      });
    }
  );
}
}

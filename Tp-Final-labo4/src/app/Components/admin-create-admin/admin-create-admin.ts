import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth-service';
import { ProfileService } from '../../Services/profile.service';
import { ConfimDialog } from '../../Shared/confim-dialog/confim-dialog';

@Component({
  selector: 'app-admin-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfimDialog],
  templateUrl: './admin-create-admin.html',
  styleUrl: './admin-create-admin.css',
})
export class AdminCreateAdminComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  public router = inject(Router);

  @ViewChild('confirmDialog') confirmDialog!: any;

  dialogTitle = '';
  dialogDescription = '';

  newAdminForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
  });

  activeUserSignal = this.authService.getActiveUser();

  // ⭐ Modal simple (solo mostrar mensaje)
  showMessage(message: string) {
    this.dialogTitle = 'Información';
    this.dialogDescription = message;
    this.confirmDialog.open();
  }

  createAdmin(event?: Event) {
    if (event) event.preventDefault();

    const active = this.activeUserSignal();
    if (!active || active.role !== 'superadmin') {
      this.showMessage('Solo el Administrador Principal puede crear nuevos administradores.');
      return;
    }

    if (this.newAdminForm.invalid) {
      this.newAdminForm.markAllAsTouched();
      this.showMessage('Completa todos los campos correctamente.');
      return;
    }

    const { username, password, email } = this.newAdminForm.getRawValue();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !password || !trimmedEmail) {
      this.showMessage('Completa usuario, contraseña y email.');
      return;
    }

    if (password.includes(' ')) {
      this.showMessage('La contraseña no puede contener espacios.');
      return;
    }

    this.profileService
      .checkUsernameAndEmail(trimmedUsername, trimmedEmail)
      .subscribe({
        next: ({ usernameExists, emailExists }) => {
          if (usernameExists) {
            this.showMessage('Ese nombre de usuario ya existe.');
            return;
          }

          if (emailExists) {
            this.showMessage('Ese email ya está registrado.');
            return;
          }

          this.profileService
            .createAdmin({
              username: trimmedUsername,
              password,
              email: trimmedEmail,
            })
            .subscribe({
              next: (created) => {
                if (!created) {
                  this.showMessage('No se pudo crear el administrador.');
                  return;
                }

                this.newAdminForm.reset();
                this.showMessage('Administrador creado correctamente.');

                // Navegar luego de que el usuario cierre el modal
                setTimeout(() => {
                  this.router.navigate(['/admin/users']);
                }, 500);
              },
              error: () => {
                this.showMessage('No se pudo crear el administrador.');
              },
            });
        },
        error: () => {
          this.showMessage('Error al validar usuario/email.');
        },
      });
  }
}
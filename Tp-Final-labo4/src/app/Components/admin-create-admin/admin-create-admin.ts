import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth-service';
import { ProfileService } from '../../Services/profile.service';

@Component({
  selector: 'app-admin-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-create-admin.html',
  styleUrl: './admin-create-admin.css',
})
export class AdminCreateAdminComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  public router = inject(Router);

  newAdminForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
  });

  activeUserSignal = this.authService.getActiveUser();

  createAdmin(event?: Event) {
    if (event) event.preventDefault();

    const active = this.activeUserSignal();
    if (!active || active.role !== 'superadmin') {
      alert('Solo el Administrador Principal puede crear nuevos administradores.');
      return;
    }

    if (this.newAdminForm.invalid) {
      this.newAdminForm.markAllAsTouched();
      return;
    }

    const { username, password, email } = this.newAdminForm.getRawValue();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !password || !trimmedEmail) {
      alert('Completa usuario, contraseña y email.');
      return;
    }

    if (password.includes(' ')) {
      alert('La contraseña no puede contener espacios.');
      return;
    }

    this.profileService
      .checkUsernameAndEmail(trimmedUsername, trimmedEmail)
      .subscribe({
        next: ({ usernameExists, emailExists }) => {
          if (usernameExists) {
            alert('Ese nombre de usuario ya existe.');
            return;
          }

          if (emailExists) {
            alert('Ese email ya está registrado.');
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
                  alert('No se pudo crear el administrador.');
                  return;
                }

                this.newAdminForm.reset();
                alert('Administrador creado correctamente.');
                this.router.navigate(['/admin/users']);
              },
              error: () => {
                alert('No se pudo crear el administrador.');
              },
            });
        },
        error: () => {
          alert('Error al validar usuario/email.');
        },
      });
  }
}

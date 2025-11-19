import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../Services/profile.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private formBuilder = inject(FormBuilder);

  loginError = '';

  form = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
        Validators.pattern(/^\S+$/), // sin espacios
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^\S+$/), // sin espacios
      ],
    ],
  });

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  // Getters para usar en el template
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }

  onLogin() {
    this.loginError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    if (!username || !password) {
      this.loginError = 'Faltan datos para iniciar sesión.';
      return;
    }

    this.profileService
      .login({ username, password })
      .subscribe({
        next: (loggedIn) => {
          if (loggedIn) {
            this.router.navigate(['/']);
          } else {
            this.loginError = 'Usuario o contraseña incorrectos.';
          }
        },
        error: () => {
          this.loginError = 'Error al intentar iniciar sesión.';
        },
      });
  }
}

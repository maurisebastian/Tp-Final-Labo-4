import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../Services/profile.service';
import { Profile } from '../../Interfaces/profilein';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  // ======================
  //  INYECCIONES
  // ======================
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // ======================
  //  ESTADO DEL COMPONENTE
  // ======================
  signupError = '';
  signupSuccess = '';
  isEditMode = false;
  private currentUser: Profile | undefined;

  readonly minBirthDate = '1900-01-01';
  readonly maxBirthDate = this.buildMaxDate(12);

  // ======================
  //  FORMULARIO REACTIVO
  // ======================
  form = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
        Validators.pattern(/^\S+$/),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^\S+$/),
      ],
    ],
    date: [
      '',
      [
        Validators.required,
        this.minAgeValidator(12),
        this.yearMinValidator(1900),
      ],
    ],
    cel: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  // ======================
  //  CONSTRUCTOR
  // ======================
  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const mode = this.route.snapshot.data?.['mode'];

    if (mode === 'edit') {
      this.isEditMode = true;

      const active = this.authService.getActiveUser()();
      if (!active) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = active;

      this.form.patchValue({
        username: active.username,
        password: active.password,
        date: active.date ?? '',
        cel: active.cel ?? '',
        email: active.email ?? '',
        firstName: active.firstName ?? '',
        lastName: active.lastName ?? '',
      });
    }
  }

  // ======================
  //  GETTERS
  // ======================
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }
  get date() { return this.form.controls.date; }
  get cel() { return this.form.controls.cel; }
  get email() { return this.form.controls.email; }

  // ======================
  //  VALIDADORES
  // ======================
  private minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      const birth = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();

      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return age >= minAge ? null : { minAge: true };
    };
  }

  private yearMinValidator(minYear: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      const year = new Date(value).getFullYear();
      return year >= minYear ? null : { yearMin: true };
    };
  }

  private buildMaxDate(minAge: number): string {
    const today = new Date();
    const maxYear = today.getFullYear() - minAge;
    const maxDate = new Date(maxYear, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }

  // ======================
  //  ENVÍO DE FORMULARIO
  // ======================
  onSignup(event?: Event) {
    if (event) event.preventDefault();

    this.signupError = '';
    this.signupSuccess = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const username = formValue.username;
    const email = formValue.email;

    if (!username || !email) {
      this.signupError = 'Faltan datos de usuario o email.';
      return;
    }

    // ----- MODO EDITAR PERFIL -----
    if (this.isEditMode) {
      if (!this.currentUser) return;

      const updatedUser: Profile = {
        ...this.currentUser,
        ...formValue,
        role: this.currentUser.role,
      };

      this.profileService.updateProfile(updatedUser).subscribe({
        next: (ok) => {
          if (ok) {
            this.signupSuccess = 'Perfil actualizado correctamente.';
            this.router.navigate(['/']);
          } else {
            this.signupError = 'No se pudo actualizar el perfil.';
          }
        },
        error: () => {
          this.signupError = 'Error al actualizar el perfil.';
        },
      });

      return;
    }

    // ----- MODO REGISTRO -----
    const newUser: Profile = {
      ...formValue,
      role: 'user',
      favoriteGenres: [], // se eligen luego
    };

    this.profileService
      .checkUsernameAndEmail(username, email)
      .subscribe({
        next: ({ usernameExists, emailExists }) => {
          if (usernameExists) {
            this.signupError = 'El nombre de usuario ya está registrado.';
            this.username.setErrors({ taken: true });
            return;
          }

          if (emailExists) {
            this.signupError = 'El email ya está registrado.';
            this.email.setErrors({ taken: true });
            return;
          }

          this.profileService.signup(newUser).subscribe({
            next: (ok) => {
              if (ok) {
                // 🔥 DESPUÉS DEL REGISTRO, IR A ELEGIR GÉNEROS
                this.router.navigate(['/select-genres']);
              } else {
                this.signupError = 'No se pudo registrar el usuario.';
              }
            },

            error: () => {
              this.signupError = 'No se pudo registrar el usuario.';
            },
          });
        },
        error: () => {
          this.signupError = 'Error al validar usuario y email.';
        },
      });
  }

  // ======================
  // FORMATO CELULAR
  // ======================
  onCelInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    this.form.controls['cel'].setValue(value, { emitEvent: false });
  }
}

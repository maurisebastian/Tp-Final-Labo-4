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

  private fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  signupError = '';
  signupSuccess = '';
  isEditMode = false;
  private currentUser: Profile | undefined;

  form = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
        Validators.pattern(/^\S+$/), // no permite espacios
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^\S+$/), // no permite espacios
      ],
    ],
    date: ['', [Validators.required, this.minAgeValidator(12)]],
    cel: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    
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
      });
    }
  }

  // Getters para el template
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }
 get date() { return this.form.controls.date; }
  get cel() { return this.form.controls.cel; }
  get email() { return this.form.controls.email; }

  // Validador de edad mínima
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

  onSignup() {
    this.signupError = '';
    this.signupSuccess = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    // Extraemos username y email del form
    const username = formValue.username;
    const email = formValue.email;

    // Por seguridad (y para que TS quede contento)
    if (!username || !email) {
      this.signupError = 'Faltan datos de usuario o email.';
      return;
    }

    if (this.isEditMode) {
      // MODO EDITAR PERFIL
      if (!this.currentUser) return;

      const updatedUser: Profile = {
        ...this.currentUser,
        ...formValue,
        role: this.currentUser.role  // se asegura de no cambiar el rol
      };

      this.profileService.updateProfile(updatedUser).subscribe({
        next: (ok: boolean) => {
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

    } else {
      // MODO CREAR USUARIO (alta nueva)

      const newUser: Profile = {
        ...formValue,
        role: 'user'   // cualquiera que se registre es user
      } as Profile;

      this.profileService
        .checkUsernameAndEmail(username, email)
        .subscribe({
          next: ({ usernameExists, emailExists }) => {
            if (usernameExists) {
              this.signupError = 'El nombre de usuario ya está registrado.';
              this.username.setErrors({ taken: true });
              this.username.markAsTouched();
              return;
            }

            if (emailExists) {
              this.signupError = 'El email ya está registrado.';
              this.email.setErrors({ taken: true });
              this.email.markAsTouched();
              return;
            }

            this.profileService.signup(newUser).subscribe({
              next: (ok: boolean) => {
                if (ok) {
                  this.signupSuccess = 'Usuario registrado correctamente.';
                  this.form.reset();
                  this.form.markAsPristine();
                  this.form.markAsUntouched();
                  setTimeout(() => {
                    this.router.navigate(['/']);
                  }, 600);
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
  }

}

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

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
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

  signupError = '';
  isEditMode = false;
  private currentUser: Profile | undefined;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Leemos el "mode" desde la ruta
    const mode = this.route.snapshot.data?.['mode'];

    if (mode === 'edit') {
      this.isEditMode = true;

      const active = this.profileService.auth()();
      if (!active) {
        // si no hay usuario logueado, mandamos a login o home
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = active;

      // cargamos los datos actuales en el form
      this.form.patchValue({
        username: active.username,
        password: active.password,
        date: active.date ?? '',
        cel: active.cel ?? '',
        email: active.email ?? '',
      });
    }
  }

  // getters para el HTML
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }
  get date() { return this.form.controls.date; }
  get cel() { return this.form.controls.cel; }
  get email() { return this.form.controls.email; }

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

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.isEditMode) {
      // MODO EDITAR PERFIL
      if (!this.currentUser) return;

      const updatedUser: Profile = {
        ...this.currentUser,
        ...formValue,
      };

      this.profileService.updateProfile(updatedUser).subscribe({
        next: (ok) => {
          if (ok) {
            this.router.navigate(['/']);  // o a profile-detail, como quieran
          } else {
            this.signupError = 'No se pudo actualizar el perfil.';
          }
        },
        error: () => {
          this.signupError = 'Error al actualizar el perfil.';
        },
      });

    } else {
      // MODO CREAR USUARIO (signup normal)
      const newUser: Profile = formValue;

      this.profileService.signup(newUser).subscribe({
        next: (ok) => {
          if (ok) {
            this.router.navigate(['/']);
          } else {
            this.signupError = 'No se pudo registrar el usuario.';
          }
        },
        error: () => {
          this.signupError = 'No se pudo registrar el usuario.';
        },
      });
    }
  }
}

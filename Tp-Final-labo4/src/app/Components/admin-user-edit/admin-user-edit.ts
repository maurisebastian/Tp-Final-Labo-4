import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Profile } from '../../Interfaces/profilein';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user-edit.html',
  styleUrls: ['./admin-user-edit.css'],
})
export class AdminUserEdit implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  activeUserSignal = this.authService.getActiveUser();

  editForm!: FormGroup;
  userId!: string;     // ahora es string, NO number
  loadedUser: Profile | null = null;

  ngOnInit(): void {

    // solo admins y superadmins
    const active = this.activeUserSignal();
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    // construimos el formulario
    this.editForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      cel: [
        '',
        [
          Validators.minLength(5),
          Validators.maxLength(10),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
      role: ['', Validators.required],
    });

    // ID desde la URL (string)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin']);
      return;
    }
    this.userId = idParam;

    this.loadUser();
  }

  private loadUser() {
    this.profileService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.loadedUser = user;

        this.editForm.setValue({
          username: user.username,
          email: user.email ?? '',
          cel: user.cel ?? '',
          role: user.role,
        });
      },
      error: () => {
        alert('No se pudo cargar el usuario.');
        this.router.navigate(['/admin']);
      },
    });
  }

  // Limitar celular: solo números y máximo 10 dígitos
  onCelInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    this.editForm.controls['cel'].setValue(value, { emitEvent: false });
  }

  save(event?: Event) {
    if (event) {
      event.preventDefault(); // evita recargar la página
    }

    if (!this.loadedUser || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();

    const updated: Profile = {
      ...this.loadedUser,
      username: formValue.username,
      email: formValue.email,
      cel: formValue.cel || undefined,
      role: formValue.role,
    };

    // segundo parámetro false => NO me cambies el activeUser al editado
    this.profileService.updateProfile(updated, false).subscribe({
      next: (ok) => {
        if (ok) {
          alert('Usuario actualizado correctamente.');
          this.router.navigate(['/admin','users']);
        } else {
          alert('No se pudo actualizar el usuario.');
        }
      },
      error: () => {
        alert('Error al actualizar el usuario.');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin','users']);
  }
}

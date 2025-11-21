import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.css'],
})
export class TopBar {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // usuario logueado (signal)
  activeUserSignal = this.authService.getActiveUser();

  // control de búsqueda
  busqueda = this.fb.nonNullable.control('', {
    validators: [Validators.required],
  });

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

}

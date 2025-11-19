import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-top-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {

  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  busqueda = new FormControl('', Validators.required);

  // signal con el usuario activo
  user = this.authService.getActiveUser();

   buscar() {
    const value = this.busqueda.value ?? '';
    this.router.navigate(['/search', value]);
  }

  // Sólo admins (admin o superadmin)
 isAdmin = this.authService.isAdmin;

}

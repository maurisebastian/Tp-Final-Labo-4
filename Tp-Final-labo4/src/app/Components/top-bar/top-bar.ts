import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';

@Component({
  selector: 'app-top-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {

  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);

  busqueda = new FormControl('', Validators.required);

  // signal con el usuario activo
  user = this.profileService.auth();

   buscar() {
    const value = this.busqueda.value ?? '';
    this.router.navigate(['/search', value]);
  }

  // Sólo admins (admin o superadmin)
 isAdmin(): boolean {
  return !!this.profileService.isAdmin();
}

}

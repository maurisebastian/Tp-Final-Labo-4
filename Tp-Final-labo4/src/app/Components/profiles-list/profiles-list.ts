import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Profile } from '../../Interfaces/profilein';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TopBar } from "../top-bar/top-bar";

@Component({
  selector: 'app-profiles-list',
  imports: [RouterLink, ReactiveFormsModule, TopBar],
  templateUrl: './profiles-list.html',
  styleUrl: './profiles-list.css',
})
export class ProfilesList implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];

  activeUserId = this.auth.getActiveUser()()?.id;

  searchControl = new FormControl('');

  ngOnInit() {

    // Cargar usuarios
    this.profileService.getAllUsers().subscribe({
      next: (p) => {

        // Filtrar:
        // - NO admins
        // - NO superadmins
        // - NO usuario activo
        this.profiles = p.filter(user =>
          user.role !== 'admin' &&
          user.role !== 'superadmin' &&
          user.id !== this.activeUserId
        );

        this.filteredProfiles = this.profiles.slice(0, 12);
      },
      error: (err) => console.error('Error cargando perfiles', err)
    });

    // Buscar respetando filtro original
    this.searchControl.valueChanges.subscribe(text => {
      const query = (text ?? '').toLowerCase().trim();

      const filtered = this.profiles.filter(u =>
        u.username.toLowerCase().includes(query)
      );

      this.filteredProfiles = filtered.slice(0, 12);
    });
  }
}

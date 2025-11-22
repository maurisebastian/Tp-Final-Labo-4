import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Profile } from '../../Interfaces/profilein';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profiles-list',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './profiles-list.html',
  styleUrl: './profiles-list.css',
})
export class ProfilesList implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];

  activeUserId = this.auth.getActiveUser()()?.id;

  // Nuevo FormControl
  searchControl = new FormControl('');

  ngOnInit() {

    // 1. Cargar usuarios
    this.profileService.getAllUsers().subscribe({
      next: (p) => {
        this.profiles = p.filter(user => user.id !== this.activeUserId);
        this.filteredProfiles = this.profiles.slice(0, 12);
      },
      error: (err) => console.error('Error cargando perfiles', err)
    });

    // 2. Escuchar búsquedas
    this.searchControl.valueChanges.subscribe(text => {
      const query = (text ?? '').toLowerCase().trim();

      const filtered = this.profiles.filter(u =>
        u.username.toLowerCase().includes(query)
      );

      this.filteredProfiles = filtered.slice(0, 12);
    });
  }
}



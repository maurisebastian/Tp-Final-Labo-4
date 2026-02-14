// src/app/Components/profile-detail/profile-detail.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

import { Profile, ReviewReport } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service'
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { ActivatedRoute } from '@angular/router';
import { FollowComponent } from "../follow-component/follow-component";
import { Signup } from '../signup/signup';


@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    TopBar,
    Footer,
    CommonModule,
    ReactiveFormsModule,
    FollowComponent,
    Signup
  ],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {

  // servicios
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);

  favoriteGenreNames: string[] = [];

  // estado
  userProfile: Profile | undefined;
  myReports: ReviewReport[] = [];
  userLoggedIn = false;

  // estado edición
  isEditMode = false;
  profileError = '';
  profileSuccess = '';



  ngOnInit(): void {
    const editParam = this.route.snapshot.queryParamMap.get('edit');
    this.loadUserProfile();

    if (editParam === 'true') {
      this.enableEdit();
    }
  }

  loadUserProfile() {
    const userSignal = this.authService.getActiveUser();
    const user = userSignal();

    if (user) {
      this.userProfile = user as Profile;
      this.userLoggedIn = true;

      // 🟢 géneros favoritos
      if (user.favoriteGenres && Array.isArray(user.favoriteGenres)) {
        this.favoriteGenreNames = user.favoriteGenres.map((id: any) =>
          this.tmdbService.getGenreName(Number(id)) ?? ''
        );

      } else {
        this.favoriteGenreNames = [];
      }

    } else {
      this.userLoggedIn = false;
    }
  }


  // ===== VISIBILIDAD PERFIL =====
  toggleVisibility() {
    if (!this.userProfile?.id) return;

    const newValue = !this.userProfile.isPublic;

    this.profileService
      .updateProfileVisibility(this.userProfile.id, newValue)
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.userProfile!.isPublic = newValue;
          }
        },
        error: (err) => console.error('Error cambiando visibilidad:', err),
      });
  }

  // ===== MODO EDICIÓN PERFIL =====
  enableEdit() {
    this.profileError = '';
    this.profileSuccess = '';
    this.isEditMode = true;
  }

  cancelEdit() {
    if (this.userProfile) {

    }
    this.profileError = '';
    this.profileSuccess = '';
    this.isEditMode = false;
  }
  onProfileUpdated(p: Profile) {
  this.userProfile = p;
  this.isEditMode = false;

  //  AuthService  setActiveUser / setUser:
  this.authService.setActiveUser(p); 
}


}

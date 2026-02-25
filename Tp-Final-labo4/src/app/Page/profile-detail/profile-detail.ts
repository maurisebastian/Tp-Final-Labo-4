// src/app/Components/profile-detail/profile-detail.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Profile, ReviewReport } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service'
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { ActivatedRoute } from '@angular/router';

import { Signup } from '../signup/signup';
import { FollowComponent } from '../../Components/follow-component/follow-component';


@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [

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
  private readonly fb = inject(FormBuilder);

  favoriteGenreNames: string[] = [];

  // estado
  userProfile: Profile | undefined;
  myReports: ReviewReport[] = [];
  userLoggedIn = false;

  // estado edición
  isEditMode = false;
  isEditBio = false;
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
      this.avatarBioForm.patchValue({
        avatarUrl: user.avatarUrl ?? 'assets/perfil.png',
        bio: user.bio ?? '',
      });

      this.setAvatarIndexByUrl(user.avatarUrl ?? this.avatars[0]);

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


  avatarBioForm = this.fb.nonNullable.group({
    avatarUrl: ['assets/avatar_01.png', [Validators.required, Validators.pattern(/^assets\/avatar_\d{2}\.png$/i),],],
    bio: ['', [Validators.maxLength(30)]],
  });

  cancelEditAvatar() {
    this.isEditBio = false;

    this.avatarBioForm.patchValue({
      avatarUrl: this.userProfile?.avatarUrl ?? 'assets/perfil.png',
      bio: this.userProfile?.bio ?? '',
    });
  }


  saveAvatarBio() {
    if (!this.userProfile?.id) return;

    if (this.avatarBioForm.invalid) {
      this.avatarBioForm.markAllAsTouched();
      return;
    }

    const { avatarUrl, bio } = this.avatarBioForm.getRawValue();

    const updated: Profile = {
      ...this.userProfile,
      avatarUrl,
      bio,
    };

    this.profileService.updateProfile(updated, true).subscribe((ok) => {
      if (ok) {
        this.userProfile = updated;
        this.isEditBio = false; //  cerrar editor al guardar
      }
    });
  }

  avatars: string[] = Array.from({ length: 40 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `assets/avatar_${n}.png`;
  });

  avatarIndex = 0;

  private setAvatarIndexByUrl(url?: string) {
    const idx = this.avatars.indexOf(url ?? '');
    this.avatarIndex = idx >= 0 ? idx : 0;
  }

  enableEditAvatar() {
    this.isEditBio = true;

    this.setAvatarIndexByUrl(this.userProfile?.avatarUrl ?? this.avatars[0]);

    this.avatarBioForm.patchValue({
      avatarUrl: this.avatars[this.avatarIndex],
      bio: this.userProfile?.bio ?? '',
    });
  }

  prevAvatar() {
    this.avatarIndex = (this.avatarIndex - 1 + this.avatars.length) % this.avatars.length;
    this.avatarBioForm.patchValue({ avatarUrl: this.avatars[this.avatarIndex] });
  }

  nextAvatar() {
    this.avatarIndex = (this.avatarIndex + 1) % this.avatars.length;
    this.avatarBioForm.patchValue({ avatarUrl: this.avatars[this.avatarIndex] });
  }

}

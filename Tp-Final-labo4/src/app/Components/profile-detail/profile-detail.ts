// src/app/Components/profile-detail/profile-detail.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';

import { Profile, ReviewReport } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { ReviewService } from '../../Services/review.service';
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { UserActivity } from '../user-activity/user-activity';
import { ReviewReportService } from '../../Services/review-report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FollowComponent } from "../follow-component/follow-component";

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    TopBar,
    Footer,
    UserActivity,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    FollowComponent
  ],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {

  // servicios
  private reviewService = inject(ReviewService);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private reviewReportService = inject(ReviewReportService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  favoriteGenreNames: string[] = [];

  // estado
  userProfile: Profile | undefined;
  reviews: any[] = [];
  myReports: ReviewReport[] = [];
  userLoggedIn = false;

  // estado edición
  isEditMode = false;
  profileError = '';
  profileSuccess = '';

  // límites fecha nacimiento
  readonly minBirthDate = '1900-01-01';
  readonly maxBirthDate = this.buildMaxDate(12);

  // formulario (mismas reglas que signup)
  form = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(16),
        Validators.pattern(/^\S+$/),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(/^\S+$/),
      ],
    ],
    date: [
      '',
      [
        Validators.required,
        this.minAgeValidator(12),
        this.yearMinValidator(1900),
      ],
    ],
    cel: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  // getters cómodos
  get username() { return this.form.controls.username; }
  get password() { return this.form.controls.password; }
  get date() { return this.form.controls.date; }
  get cel() { return this.form.controls.cel; }
  get email() { return this.form.controls.email; }

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

      this.form.patchValue({
        username: user.username,
        password: user.password,
        date: user.date ?? '',
        cel: user.cel ?? '',
        email: user.email ?? '',
        firstName: (user as any).firstName ?? '',
        lastName: (user as any).lastName ?? '',
      });

      this.loadUserReviews();
      this.loadUserReports(user.id as number);
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

  // ===== RESEÑAS DEL USUARIO =====
  loadUserReviews() {
    if (this.userProfile && this.userProfile.id) {
      const profileId = this.userProfile.id;

      this.reviewService.getReviewsByUserId(profileId).subscribe((reviews) => {
        this.reviews = reviews;

        this.reviews.forEach((review) => {
          this.tmdbService.getMovieDetails(review.idMovie).subscribe((movie) => {
            review.movieName = movie.title;
          });
        });
      });
    }
  }

  deleteReview(reviewId: number) {
    this.reviewService.deleteReviewById(reviewId).subscribe(
      () => {
        this.reviews = this.reviews.filter((review) => review.id !== reviewId);
      },
      (error) => {
        console.error('Error al eliminar la reseña:', error);
      }
    );
  }

  // ===== REPORTES DEL USUARIO =====
  loadUserReports(profileId: number) {
    this.reviewReportService.getReportsByUser(profileId).subscribe({
      next: (reports) => {
        this.myReports = reports;

        // Traer título de la peli para cada reporte que tenga idMovie
        this.myReports.forEach((rep: any) => {
          if (rep.idMovie) {
            this.tmdbService.getMovieDetails(rep.idMovie).subscribe({
              next: (movie) => {
                rep.movieTitle = movie.title;
              },
              error: (err) => {
                console.error('Error cargando título de película para reporte', err);
              },
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los reportes del usuario:', err);
        this.myReports = [];
      },
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
      this.form.reset({
        username: this.userProfile.username,
        password: this.userProfile.password,
        date: this.userProfile.date ?? '',
        cel: this.userProfile.cel ?? '',
        email: this.userProfile.email ?? '',
        firstName: (this.userProfile as any).firstName ?? '',
        lastName: (this.userProfile as any).lastName ?? '',
      });
    }
    this.profileError = '';
    this.profileSuccess = '';
    this.isEditMode = false;
  }

  saveProfile(event: Event) {
    event.preventDefault();
    this.profileError = '';
    this.profileSuccess = '';

    if (!this.userProfile) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const updatedUser: Profile = {
      ...this.userProfile,
      ...formValue,
      role: this.userProfile.role,
      favoriteGenres: this.userProfile.favoriteGenres ?? [],
    };

    this.profileService.updateProfile(updatedUser).subscribe({
      next: (ok) => {
        if (ok) {
          this.profileSuccess = 'Perfil actualizado correctamente.';
          this.userProfile = updatedUser;
          this.isEditMode = false;
        } else {
          this.profileError = 'No se pudo actualizar el perfil.';
        }
      },
      error: () => {
        this.profileError = 'Error al actualizar el perfil.';
      },
    });
  }

  // ===== VALIDADORES Y UTILIDADES =====
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

  private yearMinValidator(minYear: number): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;

      const year = new Date(value).getFullYear();
      return year >= minYear ? null : { yearMin: true };
    };
  }

  private buildMaxDate(minAge: number): string {
    const today = new Date();
    const maxYear = today.getFullYear() - minAge;
    const maxDate = new Date(maxYear, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }

  onCelInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    this.form.controls['cel'].setValue(value, { emitEvent: false });
  }

  // aceptar undefined sin romper
  goToMovie(movieId?: number) {
    if (!movieId) return;
    this.router.navigate(['/movie-review', movieId]);
  }
}

// src/app/Components/profile-detail/profile-detail.ts
import { Component, inject, OnInit } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { ReviewService } from '../../Services/review.service';
import { TopBar } from "../top-bar/top-bar";
import { Footer } from "../../Shared/footer/footer";
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { UserActivity } from "../user-activity/user-activity";
import { ReviewReportService } from '../../Services/review-report.service';
import { ReviewReport } from '../../Interfaces/profilein';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [TopBar, Footer, UserActivity, DatePipe],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {

  private reviewService = inject(ReviewService);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private reviewReportService = inject(ReviewReportService);

  userProfile: Profile | undefined;
  reviews: any[] = [];
  myReports: ReviewReport[] = [];
  userLoggedIn: boolean = false;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userSignal = this.authService.getActiveUser(); // signal
    const user = userSignal();

    if (user) {
      this.userProfile = user;
      this.userLoggedIn = true;

      this.loadUserReviews();
      this.loadUserReports(user.id as number);
    } else {
      this.userLoggedIn = false;
    }
  }

  toggleVisibility() {
    if (!this.userProfile?.id) return;

    const newValue = !this.userProfile.isPublic;

    this.profileService.updateProfileVisibility(this.userProfile.id, newValue)
      .subscribe({
        next: (ok) => {
          if (ok) {
            this.userProfile!.isPublic = newValue;
          }
        },
        error: (err) => console.error("Error cambiando visibilidad:", err)
      });
  }

  loadUserReviews() {
    if (this.userProfile && this.userProfile.id) {
      const profileId = this.userProfile.id;

      this.reviewService.getReviewsByUserId(profileId).subscribe((reviews) => {
        this.reviews = reviews;

        this.reviews.forEach(review => {
          this.tmdbService.getMovieDetails(review.idMovie).subscribe(movie => {
            review.movieName = movie.title;
          });
        });
      });
    }
  }

  // 🔹 Mis reportes (privados)
  loadUserReports(profileId: number) {
    this.reviewReportService.getReportsByUser(profileId).subscribe({
      next: (reports) => {
        this.myReports = reports;
      },
      error: (err) => {
        console.error('Error al cargar los reportes del usuario:', err);
        this.myReports = [];
      }
    });
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
}

import { Component, inject, OnInit } from '@angular/core';
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { UserActivity } from '../user-activity/user-activity';
import { CommonModule, DatePipe } from '@angular/common';
import { FollowComponent } from '../follow-component/follow-component';
import { ReviewService } from '../../Services/review.service';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { ProfileService } from '../../Services/profile.service';
import { ReviewReportService } from '../../Services/review-report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminMoviesService } from '../../Services/movies.service';
import { Profile, ReviewReport } from '../../Interfaces/profilein';

@Component({
  selector: 'app-my-activity-page',
  standalone: true,
  imports: [TopBar, Footer, UserActivity, DatePipe, CommonModule, FollowComponent],
  templateUrl: './my-activity-page.html',
  styleUrl: './my-activity-page.css',
})
export class MyActivityPage implements OnInit {


  // servicios
  private reviewService = inject(ReviewService);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private reviewReportService = inject(ReviewReportService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminMovies = inject(AdminMoviesService);

  favoriteGenreNames: string[] = [];

  // estado
  userProfile: Profile | undefined;
  reviews: any[] = [];
  myReports: ReviewReport[] = [];
  userLoggedIn = false;


  ngOnInit(): void {
    const editParam = this.route.snapshot.queryParamMap.get('edit');
    this.loadUserProfile();


  }

  loadUserProfile() {
    const userSignal = this.authService.getActiveUser();
    const user = userSignal();

    if (user) {
      this.userProfile = user as Profile;
      this.userLoggedIn = true;


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
    if (this.userProfile && this.userProfile.id != null) {
      const profileId = this.userProfile.id;

      this.reviewService.getReviewsByUserId(profileId).subscribe((reviews) => {
        this.reviews = reviews;

        this.reviews.forEach((review: any) => {
          const id = review.idMovie;

          // 1) Reseñas viejas sin idMovie → no hay peli asociada
          if (id == null) {
            review.movieName = 'Película desconocida';
            return;
          }

          const num = Number(id);

          // 2) TMDB (id numérico)
          if (!Number.isNaN(num)) {
            this.tmdbService.getMovieDetails(num).subscribe({
              next: (movie) => {
                review.movieName = movie.title;
              },
              error: (err) => {
                console.error('Error cargando película TMDB', err);
                review.movieName = 'Película (TMDB no encontrada)';
              },
            });
          }
          // 3) Película local (id string → adminMovies)
          else {
            this.adminMovies.getById(id).subscribe({
              next: (local) => {
                if (local) {
                  review.movieName = local.title;
                } else {
                  review.movieName = 'Película local no encontrada';
                }
              },
              error: (err) => {
                console.error('Error cargando película local', err);
                review.movieName = 'Película local no encontrada';
              },
            });
          }
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

  // aceptar undefined sin romper
  goToMovie(idMovie: string | number | undefined) {
    if (idMovie == null) return;

    const parsed = Number(idMovie);

    if (!Number.isNaN(parsed)) {
      // ✔ Película TMDB
      this.router.navigate(['/movie-review', parsed]);
    } else {
      // ✔ Película local (id string)
      this.router.navigate(['/movie-review', String(idMovie)]);
    }
  }



}

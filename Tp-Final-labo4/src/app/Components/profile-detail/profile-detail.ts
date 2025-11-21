import { Component, inject, OnInit } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { ReviewService } from '../../Services/review.service';
import { TopBar } from "../top-bar/top-bar";
import { Footer } from "../../Shared/footer/footer";
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { UserActivity } from "../user-activity/user-activity";

@Component({
  selector: 'app-profile-detail',
  imports: [TopBar, Footer, UserActivity],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {

  private reviewService = inject(ReviewService);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);

  [x: string]: any;
  userProfile: Profile | undefined;
  reviews: any[] = [];
  userLoggedIn: boolean = false;


  ngOnInit(): void {
    this.loadUserProfile();
  }

 loadUserProfile() {
  const user = this.authService.getActiveUser()();
  
  if (user) {
    this.userProfile = user;
    this.userLoggedIn = true;

    this.loadUserReviews();

  } else {
    this.userLoggedIn = false;
  }
}

  loadUserReviews() {
  if (this.userProfile && this.userProfile.id) {
    const profileId = this.userProfile.id;

    this.reviewService.getReviewsByUserId(profileId).subscribe((reviews) => {
      
      // Guardamos las reseñas
      this.reviews = reviews;

      // Por cada reseña pedimos el nombre de la película
      this.reviews.forEach(review => {
        this.tmdbService.getMovieDetails(review.idMovie).subscribe(movie => {
          review.movieName = movie.title;   //  Guardamos el título
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


}

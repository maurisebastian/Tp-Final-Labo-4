import { Component, inject } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { ReviewService } from '../../Services/review.service';
import { TopBar } from "../top-bar/top-bar";
import { Footer } from "../../Shared/footer/footer";
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-profile-detail',
  imports: [TopBar, Footer],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail {


  private profileService = inject(ProfileService);
  private reviewService = inject(ReviewService);
  private tmdbService = inject(TmdbService);

  [x: string]: any;
  userProfile: Profile | undefined;
  reviews: any[] = [];
  userLoggedIn: boolean = false;


  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserReviews();
  }

  loadUserProfile() {
  const user = this.profileService.auth()();
  if (user) {
    this.userProfile = user;
    this.userLoggedIn = true;
  } else {
    this.userLoggedIn = false;
  }
  }

  loadUserReviews() {
  if (this.userProfile && this.userProfile.id) {
    const profileId = Number(this.userProfile.id);

    this.reviewService.getReviewsByUserId(profileId).subscribe((reviews) => {
      
      // Guardamos las reseñas
      this.reviews = reviews;

      // Por cada reseña pedimos el nombre de la película
      this.reviews.forEach(review => {
        this.tmdbService.getMovieDetails(review.idMovie).subscribe(movie => {
          review.movieName = movie.title;   // 👈 Guardamos el título
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

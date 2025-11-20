import { Component, effect, inject, input } from '@angular/core';
import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile, Review } from '../../Interfaces/profilein';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-review-list',
  imports: [ReactiveFormsModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {

  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  protected fb = inject(FormBuilder);

  peliculaID = input<number>();

  userId: number | undefined = undefined;
  reviews: any[] = [];

  starRating = 0;
  userLoggedIn: boolean = false;
  userProfile: Profile | undefined;

  protected readonly reviewForm = this.fb.nonNullable.group({
    score: this.fb.nonNullable.control(0, Validators.required),
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  get score() {
    return this.reviewForm.controls.score;
  }
  get description() {
    return this.reviewForm.controls.description;
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    const id = this.peliculaID();

    if (id === undefined) {
      console.warn("No hay id de película, no se cargan reseñas");
      return;
    }

    this.reviewService.getReviewsByMovieId(id).subscribe(
      (reviews) => {
        reviews.forEach(review => {
          this.profileService.getUserById(review.idProfile).subscribe(user => {
            review.userName = `${user.username}`;
          });
        });

        this.reviews = reviews;
      },
      (error) => {
        console.error('Error al cargar reseñas:', error);
      }
    );
  }

  setStarRating(star: number) {
    this.starRating = star;
    this.reviewForm.controls.score.setValue(star);
  }

  private trackUser = effect(() => {
    const user = this.authService.getActiveUser()();

    if (user?.id) {
      this.userId = user.id;
      this.userLoggedIn = true;
    } else {
      this.userId = undefined;
      this.userLoggedIn = false;
    }
  });

  // 🔵 ***VERSION SIN ngSubmit***
  addReview(event?: Event) {
    if (event) {
      event.preventDefault(); // evita recargar la página
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.userLoggedIn || this.userId === undefined) {
      alert('Debes estar logueado para dejar una reseña.');
      return;
    }

    const movieId = this.peliculaID();
    if (movieId === undefined) {
      console.error('No se encontró el ID de la película');
      return;
    }

    const newReviewData: Review = {
      idProfile: this.userId,
      idMovie: movieId,
      score: Number(this.reviewForm.value.score),
      description: this.reviewForm.value.description ?? '',
    };

    this.reviewService.addReview(newReviewData).subscribe(
      (response) => {
        this.reviews.push(response);
        this.reviewForm.reset();
        this.starRating = 0;
      },
      (error) => {
        console.error('Error al agregar la reseña:', error);
      }
    );
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
